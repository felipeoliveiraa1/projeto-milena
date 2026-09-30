"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  CircleCheck,
  CircleDashed,
  ClipboardList,
  Minus,
  Pencil,
  Plus,
  Smartphone,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Eyebrow,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DICAS_EXAME,
  EXAME_BASE,
  INTERVALO_EXAME,
  METAS_PROXIMO_EXAME,
  METRICAS,
  METRICAS_KG,
  avaliar,
  emQuilos,
  faixaDe,
  formatarNumero,
  idadeNoExame,
  valorDe,
  type Avaliacao,
  type Bioimpedancia,
  type Faixa,
  type Metrica,
  type Sentido,
  type Tom,
} from "@/data/bioimpedancia";
import { PERFIL } from "@/data/protocol";
import {
  getExames,
  listaInicial,
  removerExame,
  salvarExame,
  type ExameListado,
  type ListaExames,
} from "@/lib/bioimpedancia";
import { dataCurta, hojeKey } from "@/lib/date";
import { useAgora } from "@/lib/now";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Formulário                                                                 */
/* -------------------------------------------------------------------------- */

type CampoNumerico =
  | "peso"
  | "gordura"
  | "musculo"
  | "visceral"
  | "metabolismo"
  | "idadeCorporal";

type Rascunho = Record<CampoNumerico | "date" | "idade" | "obs", string>;

/**
 * Campos do laudo. Os limites são só para pegar erro de digitação (vírgula no
 * lugar errado, um zero a mais) — ficam bem mais largos que o que o aparelho mede.
 */
const CAMPOS: {
  chave: CampoNumerico;
  rotulo: string;
  unidade: string;
  casas: number;
  min: number;
  max: number;
}[] = [
  { chave: "peso", rotulo: "Peso", unidade: "kg", casas: 1, min: 30, max: 250 },
  { chave: "gordura", rotulo: "Gordura corporal", unidade: "%", casas: 1, min: 3, max: 75 },
  { chave: "musculo", rotulo: "Músculo esquelético", unidade: "%", casas: 1, min: 5, max: 60 },
  { chave: "visceral", rotulo: "Gordura visceral", unidade: "nível", casas: 1, min: 0.5, max: 60 },
  { chave: "metabolismo", rotulo: "Metabolismo", unidade: "kcal", casas: 1, min: 500, max: 5000 },
  { chave: "idadeCorporal", rotulo: "Idade biológica", unidade: "anos", casas: 0, min: 10, max: 110 },
];

function rascunhoVazio(): Rascunho {
  return {
    date: hojeKey(),
    idade: String(PERFIL.idade),
    obs: "",
    peso: "",
    gordura: "",
    musculo: "",
    visceral: "",
    metabolismo: "",
    idadeCorporal: "",
  };
}

function rascunhoDe(exame: Bioimpedancia): Rascunho {
  const texto = (v: number | null) => (v === null ? "" : String(v).replace(".", ","));
  return {
    date: exame.date,
    idade: String(idadeNoExame(exame)),
    obs: exame.obs ?? "",
    peso: texto(exame.peso),
    gordura: texto(exame.gordura),
    musculo: texto(exame.musculo),
    visceral: texto(exame.visceral),
    metabolismo: texto(exame.metabolismo),
    idadeCorporal: texto(exame.idadeCorporal),
  };
}

/**
 * Número copiado do laudo: aceita "85,5", "85.5", "1.554,4" e "1554,4".
 * Vazio vira null; o que não for número vira NaN, para o aviso apontar o campo.
 */
function lerNumero(texto: string): number | null {
  const limpo = texto.trim().replace(/\s/g, "");
  if (!limpo) return null;
  let normal = limpo;
  if (limpo.includes(",")) normal = limpo.replace(/\./g, "").replace(",", ".");
  // Ponto seguido de três dígitos é milhar: "1.554" é mil quinhentos e pouco.
  else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) normal = limpo.replace(/\./g, "");
  return Number(normal);
}

function arredondar(valor: number, casas: number): number {
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
}

/* -------------------------------------------------------------------------- */
/* Datas                                                                      */
/* -------------------------------------------------------------------------- */

function paraData(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function dataCompleta(iso: string): string {
  return iso.split("-").reverse().join("/");
}

function textoProximoExame(ultimoIso: string, agora: Date | null): string {
  if (!agora) return "A cada 4 a 6 semanas, no mesmo aparelho e nas mesmas condições.";
  const de = paraData(ultimoIso);
  de.setDate(de.getDate() + INTERVALO_EXAME.minDias);
  const ate = paraData(ultimoIso);
  ate.setDate(ate.getDate() + INTERVALO_EXAME.maxDias);
  const hoje = paraData(hojeKey(agora));
  if (hoje < de) {
    return `Próximo exame entre ${dataCurta(de)} e ${dataCurta(ate)}, de 4 a 6 semanas depois do último.`;
  }
  if (hoje <= ate) return `Já está na hora: o ideal é repetir até ${dataCurta(ate)}.`;
  return `Já passou de 6 semanas desde o último exame, de ${dataCurta(paraData(ultimoIso))}. Dá para repetir assim que puder.`;
}

/* -------------------------------------------------------------------------- */
/* Quadro                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Aba do exame de bioimpedância: o último exame com a leitura de cada número,
 * a comparação com o ponto de partida, as metas do próximo e o registro.
 */
export function BioimpedanceBoard() {
  const [lista, setLista] = useState<ListaExames>(listaInicial);
  const [carregando, setCarregando] = useState(true);
  const [rascunho, setRascunho] = useState<Rascunho>(rascunhoVazio);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const formularioRef = useRef<HTMLDivElement>(null);
  const agora = useAgora();

  useEffect(() => {
    let ativo = true;
    getExames()
      .then((l) => ativo && setLista(l))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const { exames, pendentes, remocoes } = lista;
  // O de partida está sempre na lista (lib/bioimpedancia.ts garante).
  const partida = exames.find((e) => e.date === EXAME_BASE.date) ?? exames[0];
  const ultimo = exames[exames.length - 1];
  const comparando = ultimo.date > partida.date;

  function editarCampo(campo: keyof Rascunho, valor: string) {
    setRascunho((r) => ({ ...r, [campo]: valor }));
    setAviso(null);
  }

  function corrigir(exame: ExameListado) {
    setRascunho(rascunhoDe(exame));
    setAviso(null);
    formularioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function salvar() {
    const r = rascunho;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date) || r.date > hojeKey()) {
      setAviso({ tipo: "erro", texto: "Escolha a data do exame — até hoje." });
      return;
    }

    const valores = {} as Record<CampoNumerico, number | null>;
    for (const c of CAMPOS) {
      const n = lerNumero(r[c.chave]);
      if (n !== null && (Number.isNaN(n) || n < c.min || n > c.max)) {
        setAviso({ tipo: "erro", texto: `Confira “${c.rotulo}”: esse número não parece do laudo.` });
        return;
      }
      valores[c.chave] = n === null ? null : arredondar(n, c.casas);
    }
    if (CAMPOS.every((c) => valores[c.chave] === null)) {
      setAviso({ tipo: "erro", texto: "Preencha pelo menos um número do laudo." });
      return;
    }

    const idade = lerNumero(r.idade);
    if (idade !== null && (Number.isNaN(idade) || idade < 18 || idade > 99)) {
      setAviso({ tipo: "erro", texto: "Confira a sua idade no dia do exame." });
      return;
    }

    const exame: Bioimpedancia = {
      date: r.date,
      ...valores,
      // Guarda a idade de verdade, e não "vazio": quando ela fizer 40, os
      // exames antigos continuam na faixa em que foram feitos.
      idade: idade === null ? PERFIL.idade : Math.round(idade),
      obs: r.obs.trim() || null,
    };

    const existente = exames.find((e) => e.date === exame.date);
    if (existente) {
      const pergunta = existente.fixo
        ? `Isso troca os números do exame de partida (${dataCompleta(exame.date)}) pelos que você digitou. Seguir?`
        : `Já tem um exame em ${dataCompleta(exame.date)}. Trocar pelos números novos?`;
      if (!confirm(pergunta)) return;
    }

    setSalvando(true);
    try {
      setLista(await salvarExame(exame));
      setRascunho(rascunhoVazio());
      setAviso({ tipo: "ok", texto: `Exame de ${dataCompleta(exame.date)} salvo.` });
      setTimeout(() => setAviso((a) => (a?.tipo === "ok" ? null : a)), 3000);
    } finally {
      setSalvando(false);
    }
  }

  async function apagar(exame: ExameListado) {
    const pergunta =
      exame.date === EXAME_BASE.date
        ? `Apagar a correção? O exame de ${dataCompleta(exame.date)} volta a valer como estava no laudo.`
        : `Apagar o exame de ${dataCompleta(exame.date)}?`;
    if (!confirm(pergunta)) return;
    setLista(await removerExame(exame.date));
  }

  const quilosUltimo = emQuilos(ultimo);
  const quilosPartida = emQuilos(partida);

  return (
    <div className="space-y-5">
      {/* Último exame ----------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-brand">{comparando ? "Último exame" : "Ponto de partida"}</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-brand" /> Bioimpedância de{" "}
            {dataCurta(paraData(ultimo.date))}
          </CardTitle>
          <CardDescription>
            {carregando
              ? "Buscando os exames salvos..."
              : comparando
                ? `Comparado com o ponto de partida, de ${dataCompleta(partida.date)}. Verde é o lado certo, terracota é o contrário e cinza é neutro ou pequeno demais para contar.`
                : "O começo da recomposição. Os próximos exames entram aqui e são comparados com este."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-line">
            {METRICAS.map((m) => (
              <LinhaMetrica
                key={m.chave}
                metrica={m}
                ultimo={ultimo}
                partida={comparando ? partida : null}
              />
            ))}
          </ul>

          <div className="mt-3 rounded-xl2 border border-line bg-bone/50 p-3.5">
            <Eyebrow>Em quilos</Eyebrow>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {METRICAS_KG.map((k) => {
                const valor = quilosUltimo[k.chave];
                const de = comparando ? quilosPartida[k.chave] : null;
                return (
                  <div key={k.chave} className="min-w-0">
                    <p className="text-[0.625rem] tracking-wide text-ink-muted uppercase">
                      {k.rotulo}
                    </p>
                    <p className="font-display mt-0.5 text-xl leading-none text-ink tabular">
                      {valor === null ? "—" : formatarNumero(valor)}
                      {valor !== null && <span className="text-xs text-ink-muted"> kg</span>}
                    </p>
                    {valor !== null && de !== null && (
                      <Variacao
                        de={de}
                        para={valor}
                        casas={1}
                        unidade="kg"
                        sentido={k.sentido}
                        tolerancia={k.tolerancia}
                        className="mt-1"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">
              Conta do app: peso × porcentagem do laudo. Massa magra é tudo o que não é gordura —
              músculo, água, osso e órgãos. É ela que a proteína e a musculação protegem enquanto a
              gordura sai.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metas ---------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-plum">Próximo exame</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Target className="h-4.5 w-4.5 text-plum" /> O que buscar
          </CardTitle>
          <CardDescription>{textoProximoExame(ultimo.date, agora)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {METAS_PROXIMO_EXAME.map((meta) => {
            // Com um exame só (o de partida), ainda não há o que conferir.
            const status = comparando ? meta.confere(exames, partida) : null;
            return (
              <div
                key={meta.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl2 border p-3.5",
                  status?.atingida ? "border-brand/20 bg-brand-soft/50" : "border-line bg-bone/40",
                )}
              >
                {status?.atingida ? (
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                ) : (
                  <CircleDashed
                    className={cn("mt-0.5 h-4 w-4 shrink-0", status ? "text-gold" : "text-plum")}
                    aria-hidden
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{meta.titulo}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{meta.porque}</p>
                  {status && (
                    <p
                      className={cn(
                        "mt-1.5 text-xs leading-relaxed font-bold tabular",
                        status.atingida ? "text-brand" : "text-gold",
                      )}
                    >
                      {status.atingida ? "Chegou lá" : "Ainda não"}
                      <span className="font-semibold"> — {status.detalhe}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Como repetir ---------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-ink-muted">Para comparar direito</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <ClipboardList className="h-4.5 w-4.5 text-ink-soft" /> Como repetir o exame
          </CardTitle>
          <CardDescription>
            O aparelho passa uma corrente fraquinha pelo corpo: a água do músculo conduz, a gordura
            conduz mal. Comida, água, treino e álcool mexem nessa água — por isso as condições
            precisam se repetir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {DICAS_EXAME.map((dica) => (
              <li key={dica} className="flex gap-2.5 text-sm leading-relaxed text-ink-soft">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-mid" aria-hidden />
                {dica}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Registrar -------------------------------------------------------------- */}
      <Card ref={formularioRef} className="scroll-mt-24">
        <CardHeader>
          <Eyebrow className="text-ink-muted">Laudo novo</Eyebrow>
          <CardTitle className="mt-1.5 flex items-center gap-2">
            <Plus className="h-4.5 w-4.5 text-brand" /> Registrar exame
          </CardTitle>
          <CardDescription>
            Copie do laudo. O que o aparelho não mostrar, deixe em branco — vírgula ou ponto, tanto
            faz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-ink-soft">Data do exame</span>
              <Input
                type="date"
                value={rascunho.date}
                max={hojeKey()}
                onChange={(e) => editarCampo("date", e.target.value)}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-ink-soft">Sua idade</span>
              <Input
                inputMode="numeric"
                placeholder="anos"
                value={rascunho.idade}
                onChange={(e) => editarCampo("idade", e.target.value)}
              />
            </label>
          </div>
          <p className="-mt-1 text-[0.6875rem] leading-relaxed text-ink-muted">
            A idade entra porque as faixas de gordura e de músculo mudam aos 40.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {CAMPOS.map((c) => (
              <label key={c.chave} className="space-y-1">
                <span className="text-xs font-semibold text-ink-soft">{c.rotulo}</span>
                <Input
                  inputMode="decimal"
                  placeholder={c.unidade}
                  value={rascunho[c.chave]}
                  onChange={(e) => editarCampo(c.chave, e.target.value)}
                />
              </label>
            ))}
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-ink-soft">Anotação (opcional)</span>
            <Input
              placeholder="Ex.: 7h, em jejum, mesma clínica"
              value={rascunho.obs}
              onChange={(e) => editarCampo("obs", e.target.value)}
            />
          </label>

          {aviso && (
            <p
              role={aviso.tipo === "erro" ? "alert" : "status"}
              className={cn(
                "rounded-xl2 px-3.5 py-2.5 text-xs font-semibold leading-relaxed",
                aviso.tipo === "erro" ? "bg-danger-soft text-danger" : "bg-brand-soft text-brand",
              )}
            >
              {aviso.texto}
            </p>
          )}

          <Button onClick={salvar} disabled={salvando} className="w-full">
            <Plus className="h-4 w-4" /> {salvando ? "Salvando..." : "Salvar exame"}
          </Button>
        </CardContent>
      </Card>

      {/* Histórico -------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <Eyebrow className="text-ink-muted">Histórico</Eyebrow>
          <CardTitle className="mt-1.5">Exames</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Pendente e exclusão na fila vêm de falta de internet, sessão
              vencida ou da tabela ainda não criada no Supabase (migration 0006,
              ver docs/setup-supabase.md). Em todos os casos, a próxima leitura
              com a nuvem no ar resolve sozinha: ao abrir esta aba, salvar ou
              apagar. */}
          {pendentes > 0 && (
            <p className="flex items-start gap-2 rounded-xl2 bg-gold-soft px-3.5 py-2.5 text-xs leading-relaxed font-semibold text-gold">
              <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {pendentes === 1
                ? "1 exame ainda só neste aparelho — ele sobe sozinho para a nuvem assim que a sincronização estiver funcionando."
                : `${pendentes} exames ainda só neste aparelho — sobem sozinhos para a nuvem assim que a sincronização estiver funcionando.`}
            </p>
          )}
          {remocoes > 0 && (
            <p className="flex items-start gap-2 rounded-xl2 bg-gold-soft px-3.5 py-2.5 text-xs leading-relaxed font-semibold text-gold">
              <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {remocoes === 1
                ? "A exclusão de 1 exame ainda não chegou à nuvem — chega sozinha assim que a sincronização estiver funcionando."
                : `A exclusão de ${remocoes} exames ainda não chegou à nuvem — chega sozinha assim que a sincronização estiver funcionando.`}
            </p>
          )}

          <ul className="divide-y divide-line">
            {[...exames].reverse().map((e) => (
              <li key={e.date} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink tabular">
                    {dataCompleta(e.date)}
                    {e.date === partida.date && (
                      <span className="rounded-full bg-plum-soft px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-plum uppercase">
                        ponto de partida
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-muted tabular">
                    {resumoDoExame(e)}
                  </p>
                  {e.obs && <p className="mt-0.5 text-xs text-ink-muted italic">{e.obs}</p>}
                </div>
                <div className="flex shrink-0">
                  <button
                    onClick={() => corrigir(e)}
                    className="rounded-full p-2.5 text-ink-muted transition hover:bg-line-soft hover:text-ink"
                    aria-label={`Corrigir o exame de ${dataCompleta(e.date)}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {!e.fixo && (
                    <button
                      onClick={() => apagar(e)}
                      className="rounded-full p-2.5 text-ink-muted transition hover:bg-danger-soft hover:text-danger"
                      aria-label={`Apagar o exame de ${dataCompleta(e.date)}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Peças                                                                      */
/* -------------------------------------------------------------------------- */

/** Casas para mostrar: as da métrica, ou inteiro quando o laudo traz inteiro. */
function casasPara(metrica: Metrica, ...valores: (number | null)[]): number {
  if (metrica.casas !== undefined) return metrica.casas;
  return valores.every((v) => v === null || Number.isInteger(v)) ? 0 : 1;
}

function comUnidade(texto: string, unidade: string): string {
  if (!unidade) return texto;
  return unidade === "%" ? `${texto}%` : `${texto} ${unidade}`;
}

/** "-1 ano", "+1,0 ponto": com o número 1, a unidade por extenso vai para o singular. */
function unidadeParaNumero(unidade: string, valor: number): string {
  if (Math.abs(valor) !== 1) return unidade;
  if (unidade === "anos") return "ano";
  if (unidade === "pontos") return "ponto";
  return unidade;
}

function LinhaMetrica({
  metrica,
  ultimo,
  partida,
}: {
  metrica: Metrica;
  ultimo: Bioimpedancia;
  /** Exame de partida, só quando existe um mais novo para comparar. */
  partida: Bioimpedancia | null;
}) {
  const valor = valorDe(ultimo, metrica.chave);
  const idade = idadeNoExame(ultimo);
  const faixa = valor === null ? null : faixaDe(metrica.chave, valor, idade);
  const de = partida ? valorDe(partida, metrica.chave) : null;
  const casas = casasPara(metrica, valor, de);

  return (
    <li className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-bold text-ink">{metrica.rotulo}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{metrica.significado}</p>
        {faixa && (
          <p className="mt-1 text-[0.6875rem] font-semibold text-ink-soft tabular">
            Normal: {faixa.normal}
          </p>
        )}
        {metrica.chave === "idadeCorporal" && valor !== null && (
          <p className="mt-1 text-[0.6875rem] font-semibold text-ink-soft tabular">
            Sua idade no exame: {idade} anos
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
        <p className="font-display text-2xl leading-none text-ink tabular">
          {valor === null ? (
            "—"
          ) : (
            <>
              {formatarNumero(valor, casas)}
              {metrica.unidade && (
                <span className="text-sm text-ink-muted">
                  {metrica.unidade === "%" ? "%" : ` ${metrica.unidade}`}
                </span>
              )}
            </>
          )}
        </p>
        {faixa && <Selo faixa={faixa} />}
        {valor !== null && de !== null && (
          <Variacao
            de={de}
            para={valor}
            casas={casas}
            // Variação de porcentagem é em pontos: 47,4% → 45,4% é "-2 pontos".
            unidade={metrica.unidade === "%" ? "pontos" : metrica.unidade}
            sentido={metrica.sentido}
            tolerancia={metrica.tolerancia}
          />
        )}
      </div>
    </li>
  );
}

const COR_DO_TOM: Record<Tom, string> = {
  bom: "bg-brand-soft text-brand",
  atencao: "bg-gold-soft text-gold",
  alerta: "bg-clay-soft text-clay-deep",
};

function Selo({ faixa }: { faixa: Faixa }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-[0.6875rem] font-bold whitespace-nowrap",
        COR_DO_TOM[faixa.tom],
      )}
    >
      {faixa.rotulo}
    </span>
  );
}

const COR_DA_AVALIACAO: Record<Avaliacao, string> = {
  melhorou: "text-brand",
  piorou: "text-clay",
  estavel: "text-ink-muted",
  neutro: "text-ink-muted",
};

/** Só para leitor de tela: a cor sozinha não conta para quem não vê. */
const LEITURA_DA_AVALIACAO: Record<Avaliacao, string> = {
  melhorou: "no sentido certo",
  piorou: "no sentido contrário",
  estavel: "estável",
  neutro: "",
};

function Variacao({
  de,
  para,
  casas,
  unidade,
  sentido,
  tolerancia,
  className,
}: {
  de: number;
  para: number;
  casas: number;
  unidade: string;
  sentido: Sentido;
  tolerancia: number;
  className?: string;
}) {
  const delta = arredondar(para - de, casas);
  const avaliacao = avaliar(sentido, tolerancia, de, para);
  const Icone = delta < 0 ? TrendingDown : delta > 0 ? TrendingUp : Minus;
  const sinal = delta > 0 ? "+" : delta < 0 ? "-" : "";
  const leitura = LEITURA_DA_AVALIACAO[avaliacao];

  return (
    <p
      className={cn(
        "flex items-center gap-1 text-xs font-bold tabular",
        COR_DA_AVALIACAO[avaliacao],
        className,
      )}
    >
      <Icone className="h-3 w-3 shrink-0" aria-hidden />
      {comUnidade(`${sinal}${formatarNumero(delta, casas)}`, unidadeParaNumero(unidade, delta))}
      {leitura && <span className="sr-only"> ({leitura})</span>}
    </p>
  );
}

/** Uma linha com o que o exame trouxe, para a lista. */
function resumoDoExame(exame: Bioimpedancia): string {
  const partes: string[] = [];
  const inteiroOuUma = (v: number) => formatarNumero(v, Number.isInteger(v) ? 0 : 1);
  if (exame.peso !== null) partes.push(`${formatarNumero(exame.peso)} kg`);
  if (exame.gordura !== null) partes.push(`gordura ${formatarNumero(exame.gordura)}%`);
  if (exame.musculo !== null) partes.push(`músculo ${formatarNumero(exame.musculo)}%`);
  if (exame.visceral !== null) partes.push(`visceral ${inteiroOuUma(exame.visceral)}`);
  if (exame.metabolismo !== null) partes.push(`${inteiroOuUma(exame.metabolismo)} kcal`);
  if (exame.idadeCorporal !== null) partes.push(`idade biológica ${exame.idadeCorporal}`);
  return partes.join(" · ");
}
