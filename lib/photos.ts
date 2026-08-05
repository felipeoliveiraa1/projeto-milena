"use client";

import { getSupabase } from "./supabase";

/**
 * Fotos do antes e depois, no bucket privado `progresso`.
 *
 * O bucket não é público: a imagem só é exibida através de uma URL assinada de
 * validade curta, e as políticas exigem usuário autenticado que esteja em
 * allowed_users. Antes do login elas ficavam guardadas no próprio aparelho —
 * o que ainda estiver lá pode ser enviado com `fotosLocais` + `salvarFoto`.
 */

export const BUCKET = "progresso";

export type Angulo = "frente" | "lado" | "costas";

export type Foto = {
  /** Caminho dentro do bucket — é a identidade da foto. */
  caminho: string;
  date: string;
  angulo: Angulo;
  /** URL assinada, válida por 1 hora. */
  url: string;
};

const ANGULOS: Angulo[] = ["frente", "lado", "costas"];

/** `2026-08-03__a1b2c3.jpg` → a data do registro. */
function lerNome(arquivo: string): { date: string } | null {
  const m = arquivo.match(/^(\d{4}-\d{2}-\d{2})__/);
  return m ? { date: m[1] } : null;
}

export async function listarFotos(): Promise<Foto[]> {
  const supabase = getSupabase();
  const fotos: Foto[] = [];

  for (const angulo of ANGULOS) {
    const { data, error } = await supabase.storage.from(BUCKET).list(angulo, {
      limit: 200,
      sortBy: { column: "name", order: "asc" },
    });
    if (error || !data) continue;

    const arquivos = data.filter((a) => a.name.endsWith(".jpg"));
    if (arquivos.length === 0) continue;

    const caminhos = arquivos.map((a) => `${angulo}/${a.name}`);
    const { data: assinadas } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(caminhos, 60 * 60);

    arquivos.forEach((arquivo, i) => {
      const meta = lerNome(arquivo.name);
      const assinada = assinadas?.[i];
      if (!meta || !assinada?.signedUrl) return;
      fotos.push({
        caminho: `${angulo}/${arquivo.name}`,
        date: meta.date,
        angulo,
        url: assinada.signedUrl,
      });
    });
  }

  return fotos.sort((a, b) => a.date.localeCompare(b.date));
}

export async function salvarFoto(
  imagem: Blob,
  angulo: Angulo,
  date: string,
): Promise<{ erro: string | null }> {
  const caminho = `${angulo}/${date}__${novoId()}.jpg`;
  const { error } = await getSupabase()
    .storage.from(BUCKET)
    .upload(caminho, imagem, { contentType: "image/jpeg", upsert: false });
  return { erro: error ? error.message : null };
}

export async function removerFoto(caminho: string): Promise<void> {
  await getSupabase().storage.from(BUCKET).remove([caminho]);
}

/**
 * Reduz a foto antes de enviar: 1200 px no maior lado e JPEG a 78%.
 * Uma foto de celular sai de ~4 MB para ~250 KB.
 */
export function comprimir(arquivo: File, maxLado = 1200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(leitor.error);
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("imagem inválida"));
      img.onload = () => {
        const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas indisponível"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("falha ao converter"))),
          "image/jpeg",
          0.78,
        );
      };
      img.src = leitor.result as string;
    };
    leitor.readAsDataURL(arquivo);
  });
}

function novoId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
}

/* -------------------------------------------------------------------------- */
/* Fotos que ficaram no aparelho antes do login existir                       */
/* -------------------------------------------------------------------------- */

type FotoLocal = { id: string; date: string; angulo: Angulo; imagem: string };

const BANCO_LOCAL = "milena-fotos";
const LOJA_LOCAL = "fotos";

function abrirLocal(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const req = indexedDB.open(BANCO_LOCAL, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(LOJA_LOCAL)) {
        db.createObjectStore(LOJA_LOCAL, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

export async function fotosLocais(): Promise<FotoLocal[]> {
  const db = await abrirLocal();
  if (!db) return [];
  return new Promise((resolve) => {
    const tx = db.transaction(LOJA_LOCAL, "readonly");
    const req = tx.objectStore(LOJA_LOCAL).getAll();
    req.onsuccess = () => resolve((req.result as FotoLocal[]) ?? []);
    req.onerror = () => resolve([]);
  });
}

async function apagarLocal(id: string): Promise<void> {
  const db = await abrirLocal();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(LOJA_LOCAL, "readwrite");
    tx.objectStore(LOJA_LOCAL).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

function dataUrlParaBlob(dataUrl: string): Blob {
  const [cabecalho, base64] = dataUrl.split(",");
  const tipo = cabecalho.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);
  return new Blob([buffer], { type: tipo });
}

/** Sobe para a nuvem o que estava guardado no aparelho e limpa o local. */
export async function enviarFotosLocais(): Promise<{ enviadas: number; falhas: number }> {
  const locais = await fotosLocais();
  let enviadas = 0;
  let falhas = 0;

  for (const foto of locais) {
    try {
      const { erro } = await salvarFoto(dataUrlParaBlob(foto.imagem), foto.angulo, foto.date);
      if (erro) {
        falhas++;
        continue;
      }
      await apagarLocal(foto.id);
      enviadas++;
    } catch {
      falhas++;
    }
  }

  return { enviadas, falhas };
}
