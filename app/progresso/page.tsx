"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Activity, Camera, Dumbbell, HeartPulse, Plus, Ruler, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Eyebrow,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WeightChart } from "@/components/weight-chart";
import { MeasureBoard } from "@/components/measure-board";
import { PhotoBoard } from "@/components/photo-board";
import { BioimpedanceBoard } from "@/components/bioimpedance-board";
import { addWeight, getWeights, removeWeight, type WeightEntry } from "@/lib/storage";
import { hojeKey, dataCurta } from "@/lib/date";
import { PERFIL, PLANO } from "@/data/protocol";
import { faixaImc, formatarNumero, imcDe } from "@/data/bioimpedancia";
import { usePlano } from "@/lib/protocol";
import { usePreferencias } from "@/lib/settings";
import { useAgoraVivo } from "@/lib/now";

/** As abas da página. Outra tela pode abrir direto numa: /progresso?aba=medidas. */
const ABAS = ["peso", "medidas", "fotos", "exame"] as const;
type Aba = (typeof ABAS)[number];

function comoAba(valor: string | null): Aba | null {
  return ABAS.find((a) => a === valor) ?? null;
}

// Voltar e avançar do navegador trocam a URL sem remontar a página.
function assinarUrl(avisar: () => void) {
  window.addEventListener("popstate", avisar);
  return () => window.removeEventListener("popstate", avisar);
}
const lerBusca = () => window.location.search;
const buscaNoServidor = () => "";

/**
 * Aba pedida pela URL. Lê window.location, e não useSearchParams, que numa
 * página estática exigiria Suspense. E lê com useSyncExternalStore, e não num
 * useState preguiçoso, por causa do <Link>: o Next só troca a URL depois de
 * desenhar a página nova, e o useSyncExternalStore confere a URL de novo logo
 * em seguida e corrige a aba. Aberta direto pelo endereço, já nasce certa.
 */
function useAbaDaUrl(): Aba | null {
  const busca = useSyncExternalStore(assinarUrl, lerBusca, buscaNoServidor);
  return comoAba(new URLSearchParams(busca).get("aba"));
}

export default function ProgressoPage() {
  const [list, setList] = useState<WeightEntry[]>([]);
  const [weight, setWeight] = useState("");
  // Só guarda a data que ela escolheu; sem escolha, vale o "hoje" do app, que
  // anda com o relógio (o PWA pode ficar aberto de um dia para o outro).
  const [dataEscolhida, setDate] = useState<string | null>(null);
  const agora = useAgoraVivo();
  // "Limpar" no seletor de data manda "": volta para hoje, em vez de gravar sem data.
  const date = dataEscolhida || hojeKey(agora ?? undefined);
  const [erroPeso, setErroPeso] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  // A URL só escolhe a aba de abertura; depois vale a que ela tocar.
  const abaDaUrl = useAbaDaUrl();
  const [abaTocada, setAbaTocada] = useState<Aba | null>(null);
  const aba = abaTocada ?? abaDaUrl ?? "peso";
  const status = usePlano();
  const { prefs } = usePreferencias();
  // Referência = primeira pesagem registrada; o ajuste só entra se não houver
  // nenhuma ainda.
  const PESO_INICIAL = list[0]?.weight ?? prefs.pesoInicial;
  const META = prefs.pesoMeta;

  useEffect(() => {
    getWeights().then((l) => {
      setList(l);
      setHydrated(true);
    });
  }, []);

  async function save() {
    const w = parseFloat(weight.replace(",", "."));
    if (isNaN(w) || w < 30 || w > 200 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    try {
      setList(await addWeight({ date, weight: w }));
      // O campo só limpa depois de gravar: sem internet, o peso digitado fica.
      setWeight("");
      setErroPeso(null);
    } catch (err) {
      console.error(err);
      setErroPeso("Não deu para salvar agora. Confira a internet e tente de novo.");
    }
  }

  async function remover(dataDoPeso: string) {
    try {
      setList(await removeWeight(dataDoPeso));
      setErroPeso(null);
    } catch (err) {
      console.error(err);
      setErroPeso("Não deu para apagar agora. Confira a internet e tente de novo.");
    }
  }

  const ultimo = list.at(-1)?.weight ?? PESO_INICIAL;
  const primeiro = list[0]?.weight ?? PESO_INICIAL;
  const variacao = ultimo - primeiro;
  const faltam = Math.max(0, ultimo - META);
  // IMC do último peso registrado — o do exame fica na aba Exame.
  const imc = imcDe(ultimo, PERFIL.alturaM);

  return (
    <div className="stagger space-y-5">
      <header>
        <Eyebrow className="text-ink-muted">Progresso</Eyebrow>
        <h2 className="font-display mt-2 text-4xl leading-none text-ink">Sua jornada</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Peso, fita métrica, foto e bioimpedância. Juntos contam a história — a balança sozinha
          mente.
        </p>
      </header>

      <Card className="border-brand-deep bg-brand-deep text-bone">
        <CardContent className="p-6">
          <Eyebrow className="text-bone/50">Peso de hoje</Eyebrow>
          <p className="font-display mt-2 text-6xl leading-none text-bone tabular">
            {ultimo.toFixed(1).replace(".", ",")}
            <span className="text-2xl text-bone/60"> kg</span>
          </p>
          <p className="mt-2.5 text-sm text-bone/70 tabular">
            {hydrated ? (
              <>
                IMC {formatarNumero(imc)} <span className="text-bone/40">·</span>{" "}
                {faixaImc(imc).rotulo}
              </>
            ) : (
              "IMC —"
            )}
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Stat
              rotulo="Variação"
              valor={
                hydrated
                  ? `${variacao > 0 ? "+" : ""}${variacao.toFixed(1).replace(".", ",")} kg`
                  : "—"
              }
            />
            <Stat rotulo="Faltam" valor={`${faltam.toFixed(1).replace(".", ",")} kg`} />
            <Stat rotulo="Meta" valor={`${META} kg`} />
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={aba}
        onValueChange={(valor) => setAbaTocada(comoAba(valor))}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="peso" className="flex-1">
            Peso
          </TabsTrigger>
          <TabsTrigger value="medidas" className="flex-1">
            Medidas
          </TabsTrigger>
          <TabsTrigger value="fotos" className="flex-1">
            Fotos
          </TabsTrigger>
          <TabsTrigger value="exame" className="flex-1">
            Exame
          </TabsTrigger>
        </TabsList>

        {/* -------------------------------------------------------------- */}
        <TabsContent value="peso" className="space-y-5">
          <Card>
            <CardHeader>
              <Eyebrow className="text-ink-muted">Evolução</Eyebrow>
              <CardTitle className="mt-1.5">Gráfico</CardTitle>
              <CardDescription>Linha escura = você · linha tracejada = meta</CardDescription>
            </CardHeader>
            <CardContent>
              <WeightChart entries={list} pesoInicial={PESO_INICIAL} meta={META} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Eyebrow className="text-ink-muted">Balança</Eyebrow>
              <CardTitle className="mt-1.5">Registrar peso</CardTitle>
              <CardDescription>
                1 a 2 vezes por semana, de manhã, em jejum, depois do banheiro.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={hojeKey()}
                />
                <Input
                  inputMode="decimal"
                  placeholder="Peso (kg)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <Button onClick={save}>
                  <Plus className="h-4 w-4" /> Salvar
                </Button>
              </div>

              {erroPeso && (
                <p role="alert" className="text-xs font-semibold text-danger">
                  {erroPeso}
                </p>
              )}

              {hydrated && list.length === 0 && (
                <p className="text-sm text-ink-muted">Nenhum registro ainda.</p>
              )}

              <ul className="divide-y divide-line">
                {[...list].reverse().map((e) => (
                  <li key={e.date} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-bold text-ink tabular">
                        {e.weight.toFixed(1).replace(".", ",")} kg
                      </p>
                      <p className="text-xs text-ink-muted tabular">
                        {dataCurta(new Date(e.date + "T00:00:00"))}
                      </p>
                    </div>
                    <button
                      onClick={() => void remover(e.date)}
                      className="rounded-full p-2.5 text-ink-muted transition hover:bg-danger-soft hover:text-danger"
                      aria-label={`Remover registro de ${dataCurta(new Date(e.date + "T00:00:00"))}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------------------------------------- */}
        <TabsContent value="medidas">
          <MeasureBoard />
        </TabsContent>

        {/* -------------------------------------------------------------- */}
        <TabsContent value="fotos">
          <PhotoBoard />
        </TabsContent>

        {/* -------------------------------------------------------------- */}
        <TabsContent value="exame">
          <BioimpedanceBoard />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <Eyebrow className="text-plum">{PLANO.nome}</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Camera className="h-4.5 w-4.5 text-plum" /> Marcos da recomposição
          </CardTitle>
          <CardDescription>
            {status && !status.naoComecou && `Semana ${status.semana} da jornada, dia ${status.dia}. `}
            O resultado se mede por foto, fita, exame e força — não só pela balança.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Marco icone={<Camera className="h-4 w-4" />}>
            <strong className="text-ink">Foto a cada 4 semanas</strong> — frente, lado e costas, com
            a mesma roupa e a mesma luz.
            <Proxima semana={status?.semana ?? 0} cada={4} estaSemana="Esta semana é de foto." />
          </Marco>
          <Marco icone={<Ruler className="h-4 w-4" />}>
            <strong className="text-ink">Medidas a cada 2 semanas</strong> — cintura, abdômen,
            quadril, braço e coxa. A fita costuma mudar antes da balança.
            <Proxima semana={status?.semana ?? 0} cada={2} estaSemana="Esta semana é de medir." />
          </Marco>
          <Marco icone={<Activity className="h-4 w-4" />}>
            <strong className="text-ink">Bioimpedância a cada 4 a 6 semanas</strong>, no mesmo
            aparelho e nas mesmas condições — o passo a passo está na aba Exame.
          </Marco>
          <Marco icone={<Dumbbell className="h-4 w-4" />}>
            <strong className="text-ink">Força na musculação</strong>: compare as cargas que você
            anota em cada exercício do{" "}
            <Link href="/treino" className="font-semibold text-plum underline underline-offset-2">
              treino
            </Link>
            . Carga igual ou subindo faz parte do sinal do plano — “{PLANO.objetivo}”
          </Marco>
          <Marco icone={<HeartPulse className="h-4 w-4" />}>
            <strong className="text-ink">Sintomas</strong> ficam no checklist diário, na{" "}
            <Link href="/rotina" className="font-semibold text-plum underline underline-offset-2">
              aba Rotina
            </Link>
            .
          </Marco>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-2xl bg-bone/10 px-2.5 py-2.5">
      <p className="text-[0.625rem] tracking-wide text-bone/50 uppercase">{rotulo}</p>
      {/* Em 320 px, "-2,3 kg" não pode deixar o "kg" sozinho embaixo. */}
      <p className="mt-0.5 whitespace-nowrap text-sm font-bold text-bone tabular">{valor}</p>
    </div>
  );
}

/**
 * Quando cai o próximo marco, contando da semana 1 da jornada: a semana 1 tem
 * foto e medidas, e daí em diante a cada `cada` semanas. Antes de começar, nada.
 */
function Proxima({
  semana,
  cada,
  estaSemana,
}: {
  semana: number;
  cada: number;
  estaSemana: string;
}) {
  if (semana < 1) return null;
  const resto = (semana - 1) % cada;
  return (
    <span className="mt-1 block text-xs font-semibold text-plum tabular">
      {resto === 0 ? estaSemana : `A próxima é na semana ${semana + cada - resto}.`}
    </span>
  );
}

function Marco({ icone, children }: { icone: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl2 border border-line bg-bone/40 p-3.5">
      <span className="mt-0.5 shrink-0 text-plum">{icone}</span>
      <p className="text-sm leading-relaxed text-ink-muted">{children}</p>
    </div>
  );
}
