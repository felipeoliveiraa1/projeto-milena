"use client";

/**
 * Fotos do antes e depois.
 *
 * Ficam guardadas no próprio aparelho (IndexedDB), e não no Supabase, por um
 * motivo concreto: o app não tem login e as tabelas estão liberadas para leitura
 * anônima — qualquer pessoa com o endereço leria o que estivesse lá. Foto de
 * corpo não entra nesse arranjo. Para sincronizar entre aparelhos com segurança,
 * seria preciso antes colocar autenticação e um bucket privado.
 */

export type Foto = {
  id: string;
  /** AAAA-MM-DD */
  date: string;
  angulo: "frente" | "lado" | "costas";
  /** JPEG já reduzido, em data URL. */
  imagem: string;
  criadaEm: number;
};

const BANCO = "milena-fotos";
const LOJA = "fotos";

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BANCO, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(LOJA)) {
        db.createObjectStore(LOJA, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function listarFotos(): Promise<Foto[]> {
  if (typeof indexedDB === "undefined") return [];
  const db = await abrir();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOJA, "readonly");
    const req = tx.objectStore(LOJA).getAll();
    req.onsuccess = () =>
      resolve(
        (req.result as Foto[]).sort(
          (a, b) => a.date.localeCompare(b.date) || a.criadaEm - b.criadaEm,
        ),
      );
    req.onerror = () => reject(req.error);
  });
}

export async function salvarFoto(foto: Foto): Promise<void> {
  const db = await abrir();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(LOJA, "readwrite");
    tx.objectStore(LOJA).put(foto);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function removerFoto(id: string): Promise<void> {
  const db = await abrir();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(LOJA, "readwrite");
    tx.objectStore(LOJA).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Reduz a foto antes de guardar: 1200 px no maior lado e JPEG a 78%.
 * Uma foto de celular sai de ~4 MB para ~250 KB, o que cabe folgado no aparelho.
 */
export function comprimir(arquivo: File, maxLado = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(leitor.error);
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("imagem inválida"));
      img.onload = () => {
        const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
        const largura = Math.round(img.width * escala);
        const altura = Math.round(img.height * escala);
        const canvas = document.createElement("canvas");
        canvas.width = largura;
        canvas.height = altura;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas indisponível"));
        ctx.drawImage(img, 0, 0, largura, altura);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.src = leitor.result as string;
    };
    leitor.readAsDataURL(arquivo);
  });
}

export function novoIdFoto(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
