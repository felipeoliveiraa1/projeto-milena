export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Hora em que o dia do app vira. Até as 05:00 ainda vale o dia anterior: quem
 * vai dormir depois da meia-noite continua vendo a rotina e os remédios da
 * noite, e o que marcar vai para o dia certo — não para o dia seguinte.
 */
export const HORA_VIRADA_DO_DIA = 5;

/**
 * O "hoje" do app, em AAAA-MM-DD, com a virada às 05:00. Use para o que é
 * "hoje" na vida dela (o dia que está sendo preenchido, a data de uma pesagem);
 * para formatar uma data qualquer, use todayKey(data).
 */
export function hojeKey(agora: Date = new Date()): string {
  const d = new Date(agora);
  if (d.getHours() < HORA_VIRADA_DO_DIA) d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export function diaDaSemana(date: Date = new Date()): number {
  return date.getDay();
}

const DIAS_PT = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const MESES_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function dataExtenso(date: Date = new Date()): string {
  return `${DIAS_PT[date.getDay()]}, ${date.getDate()} de ${MESES_PT[date.getMonth()]}`;
}

/** A mesma data por extenso, para o meio da frase: "terça-feira, 29 de setembro". */
export function dataExtensoNaFrase(date: Date = new Date()): string {
  const s = dataExtenso(date);
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function dataCurta(date: Date = new Date()): string {
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;
}
