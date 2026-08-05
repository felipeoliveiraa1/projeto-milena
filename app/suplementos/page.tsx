import { redirect } from "next/navigation";

/**
 * Os suplementos passaram a fazer parte da rotina diária do protocolo.
 * A rota antiga continua funcionando para não quebrar atalho salvo no celular.
 */
export default function SuplementosPage() {
  redirect("/rotina");
}
