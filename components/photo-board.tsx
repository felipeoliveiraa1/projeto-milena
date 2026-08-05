"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CloudUpload, ImageOff, Lock, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Eyebrow,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  comprimir,
  enviarFotosLocais,
  fotosLocais,
  listarFotos,
  removerFoto,
  salvarFoto,
  type Angulo,
  type Foto,
} from "@/lib/photos";
import { getWeights, type WeightEntry } from "@/lib/storage";
import { useDia } from "@/components/day-context";
import { dataCurta } from "@/lib/date";
import { cn } from "@/lib/utils";

const ANGULOS: { valor: Angulo; rotulo: string }[] = [
  { valor: "frente", rotulo: "Frente" },
  { valor: "lado", rotulo: "Lado" },
  { valor: "costas", rotulo: "Costas" },
];

export function PhotoBoard() {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [angulo, setAngulo] = useState<Angulo>("frente");
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendentes, setPendentes] = useState(0);
  const [pesos, setPesos] = useState<WeightEntry[]>([]);
  /** Qual foto ocupa o lado "depois". Sem escolha, é a mais recente. */
  const [depoisEscolhido, setDepoisEscolhido] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data } = useDia();

  const recarregar = useCallback(async () => {
    try {
      setFotos(await listarFotos());
      setErro(null);
    } catch {
      setErro("Não consegui carregar o álbum agora.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    let ativo = true;
    listarFotos()
      .then((lista) => ativo && setFotos(lista))
      .catch(() => ativo && setErro("Não consegui carregar o álbum agora."))
      .finally(() => ativo && setCarregando(false));
    fotosLocais().then((locais) => ativo && setPendentes(locais.length));
    getWeights().then((lista) => ativo && setPesos(lista));
    return () => {
      ativo = false;
    };
  }, []);

  async function adicionar(arquivo: File) {
    setOcupado(true);
    setErro(null);
    try {
      const imagem = await comprimir(arquivo);
      const { erro: falha } = await salvarFoto(imagem, angulo, data);
      if (falha) {
        setErro(
          falha.toLowerCase().includes("bucket")
            ? "O bucket 'progresso' ainda não existe no Supabase."
            : falha,
        );
      } else {
        await recarregar();
      }
    } catch (e) {
      const motivo = e instanceof Error ? e.message : "";
      setErro(
        motivo.includes("não suportado")
          ? "Esse formato não abriu neste aparelho. No iPhone: Ajustes → Câmera → Formatos → Mais Compatível."
          : "Não consegui preparar essa foto. Tente outra.",
      );
    } finally {
      setOcupado(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const doAngulo = fotos.filter((f) => f.angulo === angulo);
  const primeira = doAngulo[0];
  const escolhida = doAngulo.find((f) => f.caminho === depoisEscolhido);
  const ultima =
    doAngulo.length > 1
      ? (escolhida ?? doAngulo[doAngulo.length - 1])
      : undefined;

  const diasEntre =
    primeira && ultima
      ? Math.round(
          (new Date(ultima.date + "T00:00:00").getTime() -
            new Date(primeira.date + "T00:00:00").getTime()) /
            86400000,
        )
      : 0;

  /** Peso registrado na data da foto, ou o último antes dela. */
  function pesoEm(iso: string): number | null {
    const ate = pesos.filter((p) => p.date <= iso);
    return ate.length > 0 ? ate[ate.length - 1].weight : null;
  }

  const pesoAntes = primeira ? pesoEm(primeira.date) : null;
  const pesoDepois = ultima ? pesoEm(ultima.date) : null;
  const deltaPeso =
    pesoAntes !== null && pesoDepois !== null ? pesoDepois - pesoAntes : null;

  return (
    <div className="space-y-5">
      <Card className="border-brand/20 bg-brand-soft/40">
        <CardContent className="flex items-start gap-3 p-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <p className="text-xs leading-relaxed text-ink-soft">
            As fotos ficam em um espaço{" "}
            <strong className="text-ink">privado</strong>, que só abre para quem
            entra com login. Cada imagem é exibida por um endereço temporário.
          </p>
        </CardContent>
      </Card>

      {pendentes > 0 && (
        <Card className="border-gold/30 bg-gold-soft/60">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-xs leading-relaxed text-gold">
              {pendentes}{" "}
              {pendentes === 1 ? "foto guardada" : "fotos guardadas"} neste
              aparelho de antes do login. Quer enviar para a nuvem?
            </p>
            <Button
              size="sm"
              disabled={ocupado}
              onClick={async () => {
                setOcupado(true);
                const { enviadas, falhas } = await enviarFotosLocais();
                setPendentes((p) => p - enviadas);
                if (falhas > 0)
                  setErro(`${falhas} não subiram. Tente de novo.`);
                await recarregar();
                setOcupado(false);
              }}
            >
              <CloudUpload className="h-4 w-4" /> Enviar
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <Eyebrow className="text-plum">Álbum</Eyebrow>
          <CardTitle className="mt-1.5">Antes e depois</CardTitle>
          <CardDescription>
            Mesma roupa, mesma luz e mesma distância — é o que faz a comparação
            valer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {ANGULOS.map((a) => (
              <button
                key={a.valor}
                onClick={() => setAngulo(a.valor)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                  angulo === a.valor
                    ? "border-plum bg-plum text-bone"
                    : "border-line bg-surface text-ink-muted hover:text-ink",
                )}
              >
                {a.rotulo}
              </button>
            ))}
          </div>

          {/* Sem `capture`: no iPhone isso abriria a câmera direto e tiraria a
              opção de escolher uma foto que ela já tem na galeria. */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.heic,.heif"
            className="hidden"
            onChange={(e) => {
              const arquivo = e.target.files?.[0];
              if (arquivo) adicionar(arquivo);
            }}
          />
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={ocupado}
            className="w-full"
          >
            <Camera className="h-4 w-4" />
            {ocupado ? "Enviando..." : `Adicionar foto de ${angulo}`}
          </Button>
          <p className="text-center text-xs text-ink-muted tabular">
            Vai para o dia {dataCurta(new Date(data + "T00:00:00"))}
          </p>

          {erro && <p className="text-xs font-semibold text-danger">{erro}</p>}

          {primeira && ultima ? (
            <div className="rounded-xl2 border border-brand/20 bg-brand-soft/30 p-3.5">
              <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                <Eyebrow className="text-brand">Antes e depois</Eyebrow>
                <span className="text-xs font-semibold text-ink-soft tabular">
                  {diasEntre} {diasEntre === 1 ? "dia" : "dias"} de diferença
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Comparacao foto={primeira} rotulo="Antes" peso={pesoAntes} />
                <Comparacao foto={ultima} rotulo="Depois" peso={pesoDepois} />
              </div>

              {deltaPeso !== null && deltaPeso !== 0 && (
                <p
                  className={cn(
                    "mt-2.5 text-center text-sm font-bold tabular",
                    deltaPeso < 0 ? "text-brand" : "text-clay",
                  )}
                >
                  {deltaPeso > 0 ? "+" : ""}
                  {deltaPeso.toFixed(1).replace(".", ",")} kg no período
                </p>
              )}

              {doAngulo.length > 2 && (
                <p className="mt-2 text-center text-[0.6875rem] text-ink-muted">
                  Toque em qualquer foto abaixo para colocá-la no lado “depois”.
                </p>
              )}
            </div>
          ) : (
            primeira && (
              <p className="rounded-xl2 border border-dashed border-line px-3.5 py-3 text-center text-xs leading-relaxed text-ink-muted">
                Assim que você subir a próxima foto de {angulo}, o antes e
                depois aparece aqui sozinho.
              </p>
            )
          )}

          {carregando ? (
            <p className="text-sm text-ink-muted">Carregando...</p>
          ) : doAngulo.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl2 border border-dashed border-line py-10 text-center">
              <ImageOff className="h-6 w-6 text-ink-muted" />
              <p className="text-sm text-ink-muted">
                Nenhuma foto de {angulo} ainda.
              </p>
            </div>
          ) : (
            <div>
              <Eyebrow className="mb-2 text-ink-muted">
                Todas · {doAngulo.length}
              </Eyebrow>
              <div className="grid grid-cols-3 gap-2">
                {doAngulo.map((f) => (
                  <figure
                    key={f.caminho}
                    className={cn(
                      "relative overflow-hidden rounded-xl2 border transition",
                      ultima?.caminho === f.caminho
                        ? "border-brand ring-2 ring-brand/30"
                        : "border-line",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setDepoisEscolhido(f.caminho)}
                      className="block w-full"
                      aria-label={`Usar a foto de ${dataCurta(new Date(f.date + "T00:00:00"))} como depois`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.url}
                        alt={`Foto de ${f.angulo} em ${dataCurta(new Date(f.date + "T00:00:00"))}`}
                        className="aspect-3/4 w-full object-cover"
                      />
                    </button>
                    <figcaption className="absolute inset-x-0 bottom-0 bg-ink/70 px-2 py-1 text-[0.625rem] font-semibold text-bone tabular">
                      {dataCurta(new Date(f.date + "T00:00:00"))}
                    </figcaption>
                    <button
                      onClick={async () => {
                        if (!confirm("Apagar esta foto?")) return;
                        await removerFoto(f.caminho);
                        await recarregar();
                      }}
                      aria-label="Apagar foto"
                      className="absolute top-1.5 right-1.5 rounded-full bg-ink/70 p-1.5 text-bone transition hover:bg-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </figure>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Comparacao({
  foto,
  rotulo,
  peso,
}: {
  foto: Foto;
  rotulo: string;
  peso: number | null;
}) {
  return (
    <figure className="overflow-hidden rounded-xl2 border border-line bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={foto.url}
        alt={rotulo}
        className="aspect-3/4 w-full object-cover"
      />
      <figcaption className="px-2.5 py-2">
        <p className="text-[0.625rem] font-bold tracking-wide text-ink-muted uppercase">
          {rotulo}
        </p>
        <p className="text-xs font-semibold text-ink tabular">
          {dataCurta(new Date(foto.date + "T00:00:00"))}
        </p>
        {peso !== null && (
          <p className="text-[0.6875rem] text-ink-muted tabular">
            {peso.toFixed(1).replace(".", ",")} kg
          </p>
        )}
      </figcaption>
    </figure>
  );
}
