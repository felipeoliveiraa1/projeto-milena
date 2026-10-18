import { redirect } from "next/navigation";

// Desde 18/10 o treino é um item da rotina; a rota fica só para atalho antigo não quebrar.
export default function TreinoPage() {
  redirect("/");
}
