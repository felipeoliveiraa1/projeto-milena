export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

export function dataCurta(date: Date = new Date()): string {
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;
}
