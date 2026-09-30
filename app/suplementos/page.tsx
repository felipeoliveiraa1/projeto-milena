import { redirect } from "next/navigation";

/**
 * Os remédios e suplementos passaram a fazer parte da rotina diária.
 * A rota antiga continua funcionando para não quebrar atalho salvo no celular.
 */
export default function SuplementosPage() {
  redirect("/rotina");
}
