/**
 * Agenda de lembretes do dia: a hora de cada remédio e de cada copo de água.
 *
 * Só conta, sem React, sem banco e sem "use client": o servidor dos lembretes
 * (app/api/lembretes) usa estas mesmas funções para decidir o que avisar, e as
 * telas usam para mostrar a hora ao lado de cada item. Assim o celular avisa
 * exatamente o que a tela mostra.
 *
 * O horário de cada remédio é relativo a um momento do dia (ver `horario` em
 * data/supplements.ts): acordar e deitar são os horários dela; café, almoço e
 * lanche saem da janela de comer. Mudou a janela ou a hora de acordar, todos
 * os lembretes andam junto — menos o remédio cuja hora ela mesma escolheu em
 * Ajustes (Preferencias.horariosRemedios): esse fica na hora dela.
 */

import { formatarDuracao, horariosDaJanela, paraHHMM, paraMinutos } from "./janela";
import { ehHoraRemedioValida, horariosEmOrdem, type Preferencias } from "./preferencias";
import {
  SUPPLEMENTS,
  ehSemanal,
  entraNoDia,
  type Ancora,
  type BlocoSuplemento,
  type PeriodoRotina,
  type Supplement,
} from "@/data/supplements";

export type Lembrete = {
  /** Estável no dia: "rem-07:40", "agua-03". O servidor usa para não avisar duas vezes. */
  id: string;
  /** "HH:MM". */
  hora: string;
  tipo: "remedio" | "agua";
  /** "Remédios · 07:40" | "Remédios · 07:00 · dia do Mounjaro" | "Água · 10:10". */
  titulo: string;
  /** Uma linha por item: "Mio-inositol (manhã) — 2 g — 20 min antes do café da manhã". */
  corpo: string;
  /** Para onde o toque na notificação leva: "/rotina" para remédio, "/" para água. */
  url: string;
  /** Ids dos remédios do horário (o servidor pula os já marcados). */
  suplementos?: string[];
  /** Total esperado depois deste copo, em ml (o servidor pula se ela já bebeu isso). */
  aguaAteMl?: number;
};

const ULTIMO_MINUTO_DO_DIA = 24 * 60 - 1;

/** Hora do momento do dia de onde o horário de um item é contado. */
export function horaDaAncora(prefs: Preferencias, ancora: Ancora): string {
  switch (ancora) {
    case "acordar":
      return prefs.horaAcordar;
    case "cafe":
      return prefs.janelaInicio;
    case "almoco":
      return horariosDaJanela({ inicio: prefs.janelaInicio, fim: prefs.janelaFim }).almoco;
    case "lanche":
      return horariosDaJanela({ inicio: prefs.janelaInicio, fim: prefs.janelaFim }).lanche;
    case "deitar":
      return prefs.horaDormir;
  }
}

/**
 * "HH:MM" que o app calcula para o item, ou null se ele não tem horário. Nunca
 * antes da hora de acordar: com o café logo depois de acordar, o mio-inositol
 * de "20 min antes do café" cairia com ela ainda dormindo — aí o aviso vem na
 * hora de acordar. E fica sempre dentro do mesmo dia.
 */
export function horarioPadraoDoSuplemento(s: Supplement, prefs: Preferencias): string | null {
  if (!s.horario) return null;
  const m = paraMinutos(horaDaAncora(prefs, s.horario.ancora)) + s.horario.minutos;
  const acordar = paraMinutos(prefs.horaAcordar);
  return paraHHMM(Math.max(acordar, Math.min(ULTIMO_MINUTO_DO_DIA, Math.round(m))));
}

/** A hora que ela escolheu para o item em Ajustes, se for uma hora que vale. */
function horarioEscolhido(s: Supplement, prefs: Preferencias): string | null {
  const hora = prefs.horariosRemedios[s.id];
  return ehHoraRemedioValida(hora) ? hora : null;
}

/**
 * "HH:MM" do item no dia: a hora que ela escolheu em Ajustes ou, sem escolha,
 * a que o app calcula. A dela vale como está, até antes da hora de acordar —
 * foi ela que pôs.
 */
export function horarioDoSuplemento(s: Supplement, prefs: Preferencias): string | null {
  return horarioEscolhido(s, prefs) ?? horarioPadraoDoSuplemento(s, prefs);
}

/** A hora do item é uma que ela escolheu, diferente da que o app calcula? */
export function horarioFoiEditado(s: Supplement, prefs: Preferencias): boolean {
  const escolhido = horarioEscolhido(s, prefs);
  return escolhido !== null && escolhido !== horarioPadraoDoSuplemento(s, prefs);
}

/**
 * Os horários escolhidos com o deste item trocado por `hora`. Escolher de novo
 * a hora do app, ou `null` ("Voltar ao padrão"), tira a chave: assim o item
 * volta a andar junto quando a janela ou a hora de acordar mudam. A hora entra
 * como veio — até vazia ou antes das 05:00 —, porque é o rascunho da tela:
 * ela mostra o erro e não deixa salvar, como nos outros campos.
 */
export function comHorarioDoRemedio(
  prefs: Preferencias,
  s: Supplement,
  hora: string | null,
): Record<string, string> {
  const outros = Object.entries(prefs.horariosRemedios).filter(([id]) => id !== s.id);
  const volta = hora === null || hora === horarioPadraoDoSuplemento(s, prefs);
  return horariosEmOrdem(volta ? outros : [...outros, [s.id, hora]]);
}

/** Os blocos da Farmácia que têm hora: todos menos o semanal. */
type BlocoDoDia = Exclude<BlocoSuplemento, "semanal">;

/**
 * Em que bloco da Farmácia cai uma hora: manhã até 12h, almoço até 16h, tarde
 * até 18h, noite depois. Com os horários de fábrica, cada item cai no bloco
 * da receita; com uma hora escolhida por ela, vale a hora — o remédio que ela
 * pôs às 19:00 aparece à noite.
 */
export function blocoPelaHora(hora: string): BlocoDoDia {
  const m = paraMinutos(hora);
  if (m < 12 * 60) return "manha";
  if (m < 16 * 60) return "almoco";
  if (m < 18 * 60) return "tarde";
  return "noite";
}

/**
 * O bloco do item na Farmácia: o semanal fica no dele, porque vale o dia todo;
 * o de todo dia, no bloco da hora em que cai.
 */
export function blocoDoSuplemento(s: Supplement, prefs: Preferencias): BlocoSuplemento {
  if (ehSemanal(s)) return "semanal";
  const hora = horarioDoSuplemento(s, prefs);
  return hora ? blocoPelaHora(hora) : s.bloco;
}

/** O `periodo` de cada bloco em BLOCOS_SUPLEMENTOS: almoço e tarde são o "dia" da tela inicial. */
const PERIODO_DO_BLOCO: Record<BlocoDoDia, PeriodoRotina> = {
  manha: "manha",
  almoco: "dia",
  tarde: "dia",
  noite: "noite",
};

/**
 * Em que período da tela inicial o item entra, pela hora em que cai: manhã
 * até 12h, dia até 18h, noite depois — as mesmas viradas do período da
 * rotina (lib/protocol.ts). O semanal não depende disto: no dia dele, fica na
 * tela o dia todo, até ser marcado.
 */
export function periodoDoSuplemento(s: Supplement, prefs: Preferencias): PeriodoRotina {
  const hora = horarioDoSuplemento(s, prefs);
  if (hora) return PERIODO_DO_BLOCO[blocoPelaHora(hora)];
  // Sem hora (nenhum item da lista hoje): o bloco da receita.
  return s.bloco === "semanal" ? "dia" : PERIODO_DO_BLOCO[s.bloco];
}

const NOME_ANCORA: Record<Ancora, { antes: string; junto: string; depois: string }> = {
  acordar: { antes: "antes de acordar", junto: "ao acordar", depois: "depois de acordar" },
  cafe: { antes: "antes do café", junto: "junto do café", depois: "depois do café" },
  almoco: { antes: "antes do almoço", junto: "junto do almoço", depois: "depois do almoço" },
  lanche: { antes: "antes do lanche", junto: "junto do lanche", depois: "depois do lanche" },
  deitar: { antes: "antes de deitar", junto: "na hora de deitar", depois: "depois de deitar" },
};

/**
 * Como o app conta a hora do item: "20 min antes do café", "1h20 antes do
 * lanche", "ao acordar", "depois do almoço". null sem horário.
 *
 * O "depois" sai sem os minutos: a receita diz só "após o almoço" ou "depois
 * do café", e os minutos são a folga que o app deu ao lembrete. O "antes"
 * leva os minutos, que vêm da receita ("20 min antes do café") — de uma hora
 * para cima, no jeito curto do app ("1 h", "1h20"). Antes de deitar sai "à
 * noite, antes de deitar": a B12 veio só "à noite", e a dose de cada item,
 * logo abaixo na tela, diz o resto.
 */
export function descreverHorarioPadrao(s: Supplement): string | null {
  if (!s.horario) return null;
  const { ancora, minutos } = s.horario;
  const nome = NOME_ANCORA[ancora];
  if (minutos === 0) return nome.junto;
  if (minutos > 0) return nome.depois;
  if (ancora === "deitar") return `à noite, ${nome.antes}`;
  const antes = Math.abs(minutos);
  return `${antes < 60 ? `${antes} min` : formatarDuracao(antes)} ${nome.antes}`;
}

/** A descrição da hora na tela: "horário seu" quando foi ela que escolheu; senão, a do app. */
export function descreverHorario(s: Supplement, prefs: Preferencias): string | null {
  return horarioFoiEditado(s, prefs) ? "horário seu" : descreverHorarioPadrao(s);
}

/**
 * O selo de hora do item nas telas (Farmácia e tela inicial), ou null sem
 * horário: "14:30 · horário seu" quando foi ela que escolheu; "Lembrete às
 * 07:00" no item com linha de lembrete própria — a hora é a do aviso, e quem
 * manda no horário de tomar é a receita (a de costume, no Mounjaro e na
 * testosterona); senão, "07:40 · 20 min antes do café".
 */
export function seloDoHorario(s: Supplement, prefs: Preferencias): string | null {
  const hora = horarioDoSuplemento(s, prefs);
  if (!hora) return null;
  if (!horarioFoiEditado(s, prefs) && s.lembrete) return `Lembrete às ${hora}`;
  const como = descreverHorario(s, prefs);
  return como ? `${hora} · ${como}` : hora;
}

/** AAAA-MM-DD somando dias, sem fuso: a conta é de calendário. */
function somarDias(data: string, dias: number): string {
  const [a, m, d] = data.split("-").map(Number);
  const t = new Date(Date.UTC(a, m - 1, d + dias));
  return t.toISOString().slice(0, 10);
}

/** "AAAA-MM-DD" → "DD/MM". */
export function dataCurtaDe(data: string): string {
  return `${data.slice(8, 10)}/${data.slice(5, 7)}`;
}

/**
 * Dia em que o item começa a pausa antes da cirurgia (AAAA-MM-DD), ou null
 * quando não há pausa: a data da contagem precisa existir e ser a da cirurgia,
 * e o item precisa ter `pausaAntesDaCirurgiaDias`.
 */
export function inicioDaPausa(prefs: Preferencias, s: Supplement): string | null {
  const { data, cirurgia } = prefs.contagem;
  if (!cirurgia || !data || !s.pausaAntesDaCirurgiaDias) return null;
  return somarDias(data, -s.pausaAntesDaCirurgiaDias);
}

/**
 * O item está em pausa nesse dia? A pausa não acaba sozinha depois da
 * cirurgia: volta só quando o médico liberar — ela tira a marca "É a data da
 * cirurgia" ou a data da contagem, em Ajustes.
 */
export function suplementoEmPausa(s: Supplement, prefs: Preferencias, data: string): boolean {
  const inicio = inicioDaPausa(prefs, s);
  return inicio !== null && data >= inicio;
}

/**
 * A meta de água dividida em copos, das `aguaInicio` às `aguaFim`. O primeiro
 * copo é na hora de começar e o último na de terminar; os do meio ficam com o
 * mesmo espaço entre eles, arredondados para os 5 minutos mais próximos. O
 * último copo leva o que sobra da meta (na meta de 3,2 L, 200 ml).
 */
export function planoDeAgua(prefs: Preferencias): {
  horarios: string[];
  copoMl: number;
  ultimoMl: number;
  copos: number;
} {
  const copoMl = prefs.aguaCopoMl;
  const copos = Math.max(1, Math.ceil(prefs.aguaMetaMl / copoMl));
  const inicio = paraMinutos(prefs.aguaInicio);
  const fim = paraMinutos(prefs.aguaFim);
  const passo = copos > 1 ? (fim - inicio) / (copos - 1) : 0;
  const horarios = Array.from({ length: copos }, (_, i) => {
    if (i === 0) return prefs.aguaInicio;
    if (i === copos - 1) return prefs.aguaFim;
    return paraHHMM(Math.round((inicio + passo * i) / 5) * 5);
  });
  return { horarios, copoMl, ultimoMl: prefs.aguaMetaMl - copoMl * (copos - 1), copos };
}

/** Quanto ela terá bebido depois do copo `i` (0 = o primeiro). */
function aguaAte(prefs: Preferencias, copos: number, i: number): number {
  return i === copos - 1 ? prefs.aguaMetaMl : prefs.aguaCopoMl * (i + 1);
}

/**
 * Quantos copos do plano o que ela bebeu já cobre: o copo conta quando o total
 * chega ao que era esperado depois dele.
 */
export function coposCobertos(prefs: Preferencias, ml: number): number {
  const { copos } = planoDeAgua(prefs);
  let n = 0;
  while (n < copos && ml >= aguaAte(prefs, copos, n)) n++;
  return n;
}

function lembretesDeAgua(prefs: Preferencias): Lembrete[] {
  const { horarios, copoMl, ultimoMl, copos } = planoDeAgua(prefs);
  return horarios.map((hora, i) => {
    const ultimo = i === copos - 1;
    const corpo =
      copos === 1
        ? `Copo de ${ultimoMl} ml — o único de hoje.`
        : ultimo
          ? `Copo de ${ultimoMl} ml — o último de hoje.`
          : `Copo de ${copoMl} ml — o ${i + 1}º de ${copos} de hoje.`;
    return {
      id: `agua-${String(i + 1).padStart(2, "0")}`,
      hora,
      tipo: "agua",
      titulo: `Água · ${hora}`,
      corpo,
      url: "/",
      aguaAteMl: aguaAte(prefs, copos, i),
    };
  });
}

/** Dia da semana de uma data do calendário (0 = domingo). */
function diaDaSemanaDe(data: string): number {
  return new Date(`${data}T12:00:00`).getDay();
}

/**
 * "Remédios · 07:00" e, no dia de um semanal, o aviso de que o dia é dele:
 * "· dia do Mounjaro", "· Vitamina D3 hoje". Recebe os ids do horário porque o
 * servidor monta o título de novo quando tira do aviso o que ela já marcou —
 * Mounjaro já aplicado não pode continuar no título.
 */
export function tituloDosRemedios(hora: string, ids: string[]): string {
  const semanal = SUPPLEMENTS.find((s) => ids.includes(s.id) && ehSemanal(s));
  if (!semanal) return `Remédios · ${hora}`;
  const dia = semanal.id === "mounjaro" ? "dia do Mounjaro" : `${semanal.curto} hoje`;
  return `Remédios · ${hora} · ${dia}`;
}

/**
 * A linha do item no aviso, sempre uma só (o servidor casa linha e id). Com a
 * hora que ela escolheu, a linha própria para isso, se o item tiver (a do
 * Mounjaro vira a da aplicação); senão, a de sempre.
 */
function linhaDoLembrete(s: Supplement, prefs: Preferencias): string {
  if (s.lembreteNoHorario && horarioFoiEditado(s, prefs)) return s.lembreteNoHorario;
  return s.lembrete ?? `${s.curto} — ${s.dose}`;
}

function lembretesDeRemedios(prefs: Preferencias, data: string): Lembrete[] {
  const diaSemana = diaDaSemanaDe(data);
  // Agrupa pela hora de verdade de cada item (a dela ou a do app): o que cai
  // no mesmo minuto vai num aviso só, mesmo que seja de blocos diferentes.
  const porHora = new Map<string, Supplement[]>();
  for (const s of SUPPLEMENTS) {
    if (!entraNoDia(s, diaSemana) || suplementoEmPausa(s, prefs, data)) continue;
    const hora = horarioDoSuplemento(s, prefs);
    if (!hora) continue;
    porHora.set(hora, [...(porHora.get(hora) ?? []), s]);
  }
  return [...porHora.entries()].map(([hora, todos]): Lembrete => {
    // O semanal primeiro: na quinta, a primeira linha do aviso das 07:00 é a
    // do Mounjaro — a que a tela bloqueada mostra quando corta o resto. O
    // resto fica na ordem da lista. As linhas e os ids saem da mesma lista
    // ordenada: o servidor casa a linha i com o id i (app/api/lembretes).
    const itens = [...todos.filter(ehSemanal), ...todos.filter((s) => !ehSemanal(s))];
    const ids = itens.map((s) => s.id);
    return {
      id: `rem-${hora}`,
      hora,
      tipo: "remedio",
      titulo: tituloDosRemedios(hora, ids),
      corpo: itens.map((s) => linhaDoLembrete(s, prefs)).join("\n"),
      url: "/rotina",
      suplementos: ids,
    };
  });
}

/** Os exames pré-operatórios começam 45 dias antes da cirurgia (orientação de 18/10). */
export const EXAMES_ANTES_DA_CIRURGIA_DIAS = 45;

/** Dia em que começam os exames pré-operatórios (AAAA-MM-DD), ou null sem data de cirurgia. */
export function inicioDosExames(prefs: Preferencias): string | null {
  const { data, cirurgia } = prefs.contagem;
  if (!cirurgia || !data) return null;
  return somarDias(data, -EXAMES_ANTES_DA_CIRURGIA_DIAS);
}

/**
 * Avisos de um dia só, ligados à data da cirurgia: no dia em que começam os
 * exames e no dia em que cada grupo de remédios entra em pausa. Os remédios
 * somem sozinhos da lista e dos alarmes; o aviso é para ela não estranhar —
 * e para saber que só voltam com a liberação do médico.
 */
/** "a, b e c". */
function juntarComE(nomes: string[]): string {
  return nomes.length <= 1 ? nomes.join("") : `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

function lembretesDaCirurgia(prefs: Preferencias, data: string): Lembrete[] {
  const lista: Lembrete[] = [];
  if (inicioDosExames(prefs) === data) {
    lista.push({
      id: "cirurgia-exames",
      hora: horaDaAncora(prefs, "cafe"),
      tipo: "remedio",
      titulo: "Cirurgia · exames",
      corpo: `Faltam ${EXAMES_ANTES_DA_CIRURGIA_DIAS} dias para a cirurgia: hora de começar os exames pré-operatórios.`,
      url: "/",
    });
  }
  const pausamHoje = SUPPLEMENTS.filter((s) => inicioDaPausa(prefs, s) === data);
  if (pausamHoje.length > 0) {
    const dias = pausamHoje[0].pausaAntesDaCirurgiaDias;
    lista.push({
      id: "cirurgia-pausa",
      hora: horaDaAncora(prefs, "acordar"),
      tipo: "remedio",
      titulo: "Cirurgia · pausa a partir de hoje",
      corpo: `${dias} dias antes da cirurgia: ${juntarComE(pausamHoje.map((s) => s.curto))} param hoje e só voltam quando o médico liberar.`,
      url: "/rotina",
    });
  }
  return lista;
}

/**
 * Todos os lembretes de um dia (AAAA-MM-DD), em ordem de hora. Sem `todos`,
 * respeita os tipos que ela desligou em Ajustes (lembretesRemedios,
 * lembretesAgua). Na mesma hora, o remédio vem antes da água.
 */
export function agendaDoDia(
  prefs: Preferencias,
  data: string,
  opcoes?: { todos?: boolean },
): Lembrete[] {
  const todos = opcoes?.todos === true;
  const lista = [
    ...(todos || prefs.lembretesRemedios ? lembretesDeRemedios(prefs, data) : []),
    ...(todos || prefs.lembretesRemedios ? lembretesDaCirurgia(prefs, data) : []),
    ...(todos || prefs.lembretesAgua ? lembretesDeAgua(prefs) : []),
  ];
  const ordemTipo = { remedio: 0, agua: 1 } as const;
  return lista.sort(
    (a, b) =>
      a.hora.localeCompare(b.hora) || ordemTipo[a.tipo] - ordemTipo[b.tipo] || a.id.localeCompare(b.id),
  );
}

/** Dias inteiros de calendário de `hoje` até `alvo` (AAAA-MM-DD). Negativo quando já passou. */
export function diasAte(alvo: string, hoje: string): number {
  const utc = (data: string) => {
    const [a, m, d] = data.split("-").map(Number);
    return Date.UTC(a, m - 1, d);
  };
  return Math.round((utc(alvo) - utc(hoje)) / 86_400_000);
}
