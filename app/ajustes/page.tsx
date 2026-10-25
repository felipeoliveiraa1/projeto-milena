"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  AlarmClock,
  ArrowRight,
  BellRing,
  CalendarHeart,
  CheckCircle2,
  Droplet,
  ListChecks,
  LogOut,
  Pill,
  Plus,
  RotateCcw,
  Scale,
  Smartphone,
  Timer,
  Trash2,
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
import { CAMPO_NA_LINHA, GrupoCampos, LinhaCampo } from "@/components/ui/campo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ehDataValida,
  ehHoraAcordarValida,
  ehHoraDormirValida,
  ehHoraRemedioValida,
  ehJanelaAguaValida,
  ehJanelaValida,
  usePreferencias,
  type Preferencias,
} from "@/lib/settings";
import { duracaoJanela, formatarDuracao, paraMinutos } from "@/lib/jejum";
import {
  agendaDoDia,
  comHorarioDoRemedio,
  dataCurtaDe,
  descreverHorarioPadrao,
  EXAMES_ANTES_DA_CIRURGIA_DIAS,
  horarioDoSuplemento,
  horarioFoiEditado,
  horarioPadraoDoSuplemento,
  inicioDaPausa,
  inicioDosExames,
  pausadoPorVoce,
  planoDeAgua,
  suplementoEmPausa,
} from "@/lib/lembretes";
import { NOMES_DIAS, SUPPLEMENTS, ehSemanal, type Supplement } from "@/data/supplements";
import { emailDaSessao, sair, useSessao } from "@/lib/auth";
import { hojeKey } from "@/lib/date";
import { useAgoraVivo } from "@/lib/now";
import { ResetCard } from "@/components/reset-card";
import { LembretesPush } from "@/components/lembretes-push";
import { cn } from "@/lib/utils";

// Os itens que param antes da cirurgia — para mostrar quando a pausa começa.
const COM_PAUSA = SUPPLEMENTS.filter((s) => s.pausaAntesDaCirurgiaDias);

export default function AjustesPage() {
  const { prefs, origem, carregando, salvar, restaurar } = usePreferencias();
  const { sessao } = useSessao();
  const agora = useAgoraVivo();
  const [rascunho, setRascunho] = useState<Preferencias | null>(null);
  const [salvo, setSalvo] = useState(false);

  const atual = rascunho ?? prefs;
  const mudou =
    rascunho !== null && JSON.stringify(rascunho) !== JSON.stringify(prefs);
  // Campo inválido não salva: o normalizador voltaria sozinho para o padrão,
  // e ela acharia que salvou o que digitou.
  const janelaOk = ehJanelaValida(atual.janelaInicio, atual.janelaFim);
  const horas = janelaOk
    ? duracaoJanela({ inicio: atual.janelaInicio, fim: atual.janelaFim })
    : null;
  const metaOk = atual.aguaMetaMl >= 300 && atual.aguaMetaMl <= 8000;
  const copoOk = atual.aguaCopoMl >= 100 && atual.aguaCopoMl <= 1000;
  const aguaHorasOk = ehJanelaAguaValida(atual.aguaInicio, atual.aguaFim);
  const aguaOk = metaOk && copoOk && aguaHorasOk;
  const acordarOk = ehHoraAcordarValida(atual.horaAcordar);
  const dormirOk = ehHoraDormirValida(atual.horaDormir);
  const contagem = atual.contagem;
  const dataOk = contagem.data === null || ehDataValida(contagem.data);
  const horariosOk = Object.values(atual.horariosRemedios).every(ehHoraRemedioValida);
  const tudoOk = janelaOk && aguaOk && acordarOk && dormirOk && dataOk && horariosOk;

  // Os remédios na ordem da hora salva, e não na do rascunho: mudando a hora
  // de um, a linha não pula de lugar (nem fecha o seletor) no meio da escolha.
  const remediosPorHora = [...SUPPLEMENTS].sort((a, b) =>
    (horarioDoSuplemento(a, prefs) ?? "99:99").localeCompare(horarioDoSuplemento(b, prefs) ?? "99:99"),
  );

  // Prévia dos copos: só com a água válida (copo zero daria copos infinitos).
  const plano = aguaOk ? planoDeAgua(atual) : null;
  const intervalo =
    plano && plano.copos > 1
      ? Math.round(
          (paraMinutos(atual.aguaFim) - paraMinutos(atual.aguaInicio)) / (plano.copos - 1) / 5,
        ) * 5
      : null;

  // Os lembretes de hoje com o que está na tela (salvo ou não). Só no
  // aparelho, porque o "hoje" depende do relógio dela.
  const hoje = agora ? hojeKey(agora) : null;
  const agenda = hoje && tudoOk ? agendaDoDia(atual, hoje, { todos: true }) : null;

  const inicioPausa =
    contagem.cirurgia && dataOk && contagem.data
      ? COM_PAUSA.map((s) => inicioDaPausa(atual, s)).find((d) => d !== null) ?? null
      : null;
  const inicioExames = contagem.cirurgia && dataOk ? inicioDosExames(atual) : null;
  const nomesEmPausa = COM_PAUSA.map((s) => s.curto);

  function editarContagem(patch: Partial<Preferencias["contagem"]>) {
    editar({ contagem: { ...contagem, ...patch } });
  }

  function editar(patch: Partial<Preferencias>) {
    setRascunho({ ...atual, ...patch });
    setSalvo(false);
  }

  async function aplicar() {
    if (!rascunho) return;
    await salvar(rascunho);
    setRascunho(null);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  }

  return (
    <>
      <div className="stagger space-y-5">
        <header>
          <Eyebrow className="text-ink-muted">Ajustes</Eyebrow>
          <h2 className="font-display mt-2 text-4xl leading-none text-ink">
            Do seu jeito
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Metas, horários, lembretes e a contagem regressiva. Muda aqui e vale
            no app inteiro — sem depender de atualização.
          </p>
        </header>

        {origem === "aparelho" && (
          <p className="flex items-center gap-2 rounded-xl2 bg-gold-soft px-4 py-3 text-xs font-semibold text-gold">
            <Smartphone className="h-3.5 w-3.5 shrink-0" />
            Salvo só neste aparelho: a nuvem não respondeu agora — sem internet
            ou com a sincronização ainda não configurada.
          </p>
        )}

        {/* Água -------------------------------------------------------------- */}
        <Card>
          <CardHeader>
            <Eyebrow className="text-brand-mid">Hidratação</Eyebrow>
            <CardTitle className="mt-1.5 flex items-center gap-2">
              <Droplet className="h-4.5 w-4.5 text-brand-mid" /> Água
            </CardTitle>
            <CardDescription>
              A meta do dia dividida em copos, das {atual.aguaInicio} às{" "}
              {atual.aguaFim} — os lembretes avisam a hora de cada um.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Uma linha por campo, o campo à direita: no iPhone, os campos de
                hora em duas colunas encavalavam os rótulos. */}
            <GrupoCampos>
              <LinhaCampo
                rotulo="Meta do dia"
                detalhe={
                  <span className="tabular">
                    ml · {(atual.aguaMetaMl / 1000).toFixed(1).replace(".", ",")} L por dia
                  </span>
                }
              >
                <Input
                  disabled={carregando}
                  inputMode="numeric"
                  value={String(atual.aguaMetaMl)}
                  onChange={(e) =>
                    editar({
                      aguaMetaMl: Number(e.target.value.replace(/\D/g, "")) || 0,
                    })
                  }
                  className={cn(CAMPO_NA_LINHA, "w-22")}
                />
              </LinhaCampo>
              <LinhaCampo rotulo="Tamanho do copo" detalhe="ml">
                <Input
                  disabled={carregando}
                  inputMode="numeric"
                  value={String(atual.aguaCopoMl)}
                  onChange={(e) =>
                    editar({
                      aguaCopoMl: Number(e.target.value.replace(/\D/g, "")) || 0,
                    })
                  }
                  className={cn(CAMPO_NA_LINHA, "w-22")}
                />
              </LinhaCampo>
              <LinhaCampo rotulo={"Primeiro copo\u00a0às"}>
                <Input
                  disabled={carregando}
                  type="time"
                  value={atual.aguaInicio}
                  onChange={(e) => editar({ aguaInicio: e.target.value })}
                  className={cn(CAMPO_NA_LINHA, "w-22")}
                />
              </LinhaCampo>
              <LinhaCampo rotulo={"Último copo\u00a0às"}>
                <Input
                  disabled={carregando}
                  type="time"
                  value={atual.aguaFim}
                  onChange={(e) => editar({ aguaFim: e.target.value })}
                  className={cn(CAMPO_NA_LINHA, "w-22")}
                />
              </LinhaCampo>
            </GrupoCampos>

            {plano ? (
              <p className="text-xs text-ink-muted tabular">
                {plano.copos === 1 ? (
                  <>
                    = <strong className="text-ink-soft">1 copo de {plano.ultimoMl} ml</strong>, às{" "}
                    {atual.aguaInicio}.
                  </>
                ) : (
                  <>
                    ={" "}
                    <strong className="text-ink-soft">
                      {plano.copos} copos de {plano.copoMl} ml
                    </strong>
                    {plano.ultimoMl !== plano.copoMl && ` (o último, ${plano.ultimoMl} ml)`}, mais
                    ou menos a cada {formatarDuracao(intervalo ?? 0)}.
                  </>
                )}
              </p>
            ) : (
              <p className="rounded-xl2 bg-danger-soft px-3.5 py-2.5 text-xs leading-relaxed text-danger">
                {!metaOk
                  ? "A meta precisa ficar entre 300 ml e 8 L."
                  : !copoOk
                    ? "O copo precisa ter entre 100 e 1.000 ml."
                    : "O primeiro copo precisa ser a partir das 05:00, e o último pelo menos 1 hora depois dele, no mesmo dia."}
              </p>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-ink-soft">
                Botões de registro (ml)
              </p>
              <GrupoCampos>
                {atual.aguaPorcoes.map((p, i) => (
                  <LinhaCampo
                    key={i}
                    rotulo={`Botão ${i + 1}`}
                    acao={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover botão de ${p} ml`}
                        disabled={carregando || atual.aguaPorcoes.length <= 1}
                        onClick={() =>
                          editar({
                            aguaPorcoes: atual.aguaPorcoes.filter((_, k) => k !== i),
                          })
                        }
                        className="-mr-2"
                      >
                        <Trash2 className="h-4 w-4 text-ink-muted" />
                      </Button>
                    }
                  >
                    <Input
                      disabled={carregando}
                      inputMode="numeric"
                      aria-label={`Botão ${i + 1}, em ml`}
                      value={String(p)}
                      onChange={(e) => {
                        const novo = [...atual.aguaPorcoes];
                        novo[i] = Number(e.target.value.replace(/\D/g, "")) || 0;
                        editar({ aguaPorcoes: novo });
                      }}
                      className={cn(CAMPO_NA_LINHA, "w-22")}
                    />
                  </LinhaCampo>
                ))}
              </GrupoCampos>
              {atual.aguaPorcoes.length < 4 && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={carregando}
                  onClick={() =>
                    editar({ aguaPorcoes: [...atual.aguaPorcoes, 500] })
                  }
                >
                  <Plus className="h-4 w-4" /> Adicionar botão
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seus horários --------------------------------------------------- */}
        <Card>
          <CardHeader>
            <Eyebrow className="text-clay">Seu dia</Eyebrow>
            <CardTitle className="mt-1.5 flex items-center gap-2">
              <AlarmClock className="h-4.5 w-4.5 text-clay" /> Seus horários
            </CardTitle>
            <CardDescription>
              Os lembretes dos remédios contam a partir destes horários e da
              janela de comer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <GrupoCampos>
              <LinhaCampo rotulo="Acordo às">
                <Input
                  disabled={carregando}
                  type="time"
                  value={atual.horaAcordar}
                  onChange={(e) => editar({ horaAcordar: e.target.value })}
                  className={cn(CAMPO_NA_LINHA, "w-22")}
                />
              </LinhaCampo>
              <LinhaCampo rotulo="Durmo às">
                <Input
                  disabled={carregando}
                  type="time"
                  value={atual.horaDormir}
                  onChange={(e) => editar({ horaDormir: e.target.value })}
                  className={cn(CAMPO_NA_LINHA, "w-22")}
                />
              </LinhaCampo>
            </GrupoCampos>
            {!acordarOk && (
              <p className="rounded-xl2 bg-danger-soft px-3.5 py-2.5 text-xs leading-relaxed text-danger">
                A hora de acordar precisa ficar entre 05:00 e 11:59.
              </p>
            )}
            {!dormirOk && (
              // Depois da meia-noite, os lembretes de antes de deitar cairiam no dia seguinte.
              <p className="rounded-xl2 bg-danger-soft px-3.5 py-2.5 text-xs leading-relaxed text-danger">
                A hora de dormir precisa ficar entre 18:00 e 23:59.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Horários dos remédios ------------------------------------------- */}
        <Card id="horarios-remedios" className="scroll-mt-24">
          <CardHeader>
            <Eyebrow className="text-clay">Farmácia</Eyebrow>
            <CardTitle className="mt-1.5 flex items-center gap-2">
              <Pill className="h-4.5 w-4.5 text-clay" /> Horários dos remédios
            </CardTitle>
            <CardDescription>
              O app calcula cada horário pela receita, pela janela de comer e pelos seus
              horários de acordar e dormir. Mudou aqui, muda o alarme — para todos os
              aparelhos, depois de salvar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GrupoCampos>
              {remediosPorHora.map((s) => (
                <LinhaHorarioRemedio
                  key={s.id}
                  s={s}
                  prefs={atual}
                  // Em pausa pela data da cirurgia ou pausado por ela na
                  // Farmácia (o psyllium): continua aqui e editável, para a
                  // hora já estar certa quando voltar. A pausa dela não
                  // depende do dia, então aparece mesmo antes do relógio.
                  emPausa={
                    pausadoPorVoce(s, atual) ||
                    (hoje !== null && dataOk && suplementoEmPausa(s, atual, hoje))
                  }
                  desativado={carregando}
                  onMudar={(hora) =>
                    editar({ horariosRemedios: comHorarioDoRemedio(atual, s, hora) })
                  }
                />
              ))}
            </GrupoCampos>
          </CardContent>
        </Card>

        {/* Janela alimentar ---------------------------------------------------- */}
        <Card>
          <CardHeader>
            <Eyebrow className="text-plum">Jejum</Eyebrow>
            <CardTitle className="mt-1.5 flex items-center gap-2">
              <Timer className="h-4.5 w-4.5 text-plum" /> Janela alimentar
            </CardTitle>
            <CardDescription>
              A primeira refeição abre a janela; a última vem meia hora antes de
              ela fechar. Fora dela, só água, os chás da nutricionista sem açúcar
              e os remédios nos horários da Farmácia. Os horários das refeições,
              e dos remédios ligados a elas, se ajustam sozinhos à janela.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <GrupoCampos>
              <LinhaCampo rotulo="Abre às">
                <Input
                  disabled={carregando}
                  type="time"
                  value={atual.janelaInicio}
                  onChange={(e) => editar({ janelaInicio: e.target.value })}
                  className={cn(CAMPO_NA_LINHA, "w-22")}
                />
              </LinhaCampo>
              <LinhaCampo rotulo="Fecha às">
                <Input
                  disabled={carregando}
                  type="time"
                  value={atual.janelaFim}
                  onChange={(e) => editar({ janelaFim: e.target.value })}
                  className={cn(CAMPO_NA_LINHA, "w-22")}
                />
              </LinhaCampo>
            </GrupoCampos>
            {horas ? (
              <p className="text-xs text-ink-muted tabular">
                = {formatarDuracao(horas.comendo)} comendo ·{" "}
                <strong className="text-ink-soft">
                  {formatarDuracao(horas.jejum)} de jejum
                </strong>
              </p>
            ) : (
              <p className="rounded-xl2 bg-danger-soft px-3.5 py-2.5 text-xs leading-relaxed text-danger">
                A janela precisa abrir a partir das 05:00, fechar depois de
                abrir, no mesmo dia, e ter entre 4 e 18 horas.
              </p>
            )}
            {horas && horas.jejum > 16 * 60 && (
              <p className="rounded-xl2 bg-gold-soft px-3.5 py-2.5 text-xs leading-relaxed text-gold">
                Mais de 16 horas de jejum aperta a janela a ponto de a proteína
                do dia não caber — e com o Mounjaro a fome já é pouca. Converse
                com o médico antes de esticar.
              </p>
            )}
            <p className="text-xs leading-relaxed text-ink-muted">
              O padrão é das 08:00 às 18:00: 10 horas comendo e 14 de jejum. A data
              de início da jornada você ajusta na aba Rotina.
            </p>
          </CardContent>
        </Card>

        {/* Lembretes no celular --------------------------------------------- */}
        <Card>
          <CardHeader>
            <Eyebrow className="text-clay">Avisos</Eyebrow>
            <CardTitle className="mt-1.5 flex items-center gap-2">
              <BellRing className="h-4.5 w-4.5 text-clay" /> Lembretes no celular
            </CardTitle>
            <CardDescription>
              Um aviso na hora de cada remédio e de cada copo de água. Ligar e
              desligar cada tipo vale para todos os aparelhos ativados, depois de
              salvar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Opcao
                marcado={atual.lembretesRemedios}
                desativado={carregando}
                onMudar={(v) => editar({ lembretesRemedios: v })}
                titulo="Remédios"
                detalhe="Na hora de cada um, com o nome e a dose."
              />
              <Opcao
                marcado={atual.lembretesAgua}
                desativado={carregando}
                onMudar={(v) => editar({ lembretesAgua: v })}
                titulo="Água"
                detalhe={`Um aviso por copo, das ${atual.aguaInicio} às ${atual.aguaFim}.`}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-ink-soft">Neste celular</p>
              <LembretesPush />
            </div>

            {agenda ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-ink-soft">Os lembretes de hoje</p>
                <ul className="divide-y divide-line/70 rounded-xl2 border border-line">
                  {agenda.map((l) => {
                    const ligado =
                      l.tipo === "remedio" ? atual.lembretesRemedios : atual.lembretesAgua;
                    const linhas = l.corpo.split("\n");
                    return (
                      <li
                        key={l.id}
                        className={cn(
                          "flex items-baseline gap-3 px-3.5 py-2 text-xs leading-relaxed",
                          !ligado && "opacity-45",
                        )}
                      >
                        <span className="w-10 shrink-0 font-bold text-ink tabular">{l.hora}</span>
                        <span className="min-w-0 flex-1 text-ink-muted">
                          <strong className="font-semibold text-ink-soft">
                            {l.tipo === "remedio" ? "Remédios" : "Água"}
                          </strong>{" "}
                          · {linhas[0]}
                          {linhas.length > 1 && (
                            <span className="whitespace-nowrap"> (+{linhas.length - 1})</span>
                          )}
                          {!ligado && <span className="whitespace-nowrap"> · desligado</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              hoje &&
              !tudoOk && (
                <p className="text-xs leading-relaxed text-ink-muted">
                  Corrija os avisos em vermelho acima para ver os lembretes de hoje.
                </p>
              )
            )}
          </CardContent>
        </Card>

        {/* Contagem regressiva ---------------------------------------------- */}
        <Card id="contagem" className="scroll-mt-24">
          <CardHeader>
            <Eyebrow className="text-gold">Tela inicial</Eyebrow>
            <CardTitle className="mt-1.5 flex items-center gap-2">
              <CalendarHeart className="h-4.5 w-4.5 text-gold" /> Contagem regressiva
            </CardTitle>
            <CardDescription>
              Uma data sua, com &ldquo;Faltam X dias&rdquo; no alto da tela inicial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <GrupoCampos>
              <LinhaCampo rotulo="Do que é">
                <Input
                  disabled={carregando}
                  maxLength={40}
                  placeholder="a cirurgia"
                  value={contagem.titulo}
                  onChange={(e) => editarContagem({ titulo: e.target.value })}
                  className={cn(CAMPO_NA_LINHA, "w-44")}
                />
              </LinhaCampo>
              <LinhaCampo rotulo="Data">
                <Input
                  disabled={carregando}
                  type="date"
                  value={contagem.data ?? ""}
                  onChange={(e) => editarContagem({ data: e.target.value || null })}
                  className={cn(CAMPO_NA_LINHA, "w-44")}
                />
              </LinhaCampo>
            </GrupoCampos>
            {contagem.titulo.trim() && (
              <p className="text-xs text-ink-muted">
                Na tela inicial: &ldquo;para {contagem.titulo.trim()}&rdquo;.
              </p>
            )}
            {!dataOk && (
              <p className="rounded-xl2 bg-danger-soft px-3.5 py-2.5 text-xs leading-relaxed text-danger">
                Essa data não existe no calendário.
              </p>
            )}

            <Opcao
              marcado={contagem.cirurgia}
              desativado={carregando}
              onMudar={(v) => editarContagem({ cirurgia: v })}
              titulo="É a data da cirurgia"
              detalhe="Liga as pausas de 30 dias antes — ômega-3 e curcumina, pela nutricionista; testosterona e Mounjaro, pela orientação da cirurgia — e o aviso dos exames 45 dias antes."
            />
            {inicioPausa && (
              <div className="space-y-1.5 rounded-xl2 bg-gold-soft px-3.5 py-2.5 text-xs leading-relaxed text-gold">
                {inicioExames && (
                  <p>
                    Exames pré-operatórios a partir de {dataCurtaDe(inicioExames)},{" "}
                    {EXAMES_ANTES_DA_CIRURGIA_DIAS} dias antes.
                  </p>
                )}
                <p>
                  {nomesEmPausa.slice(0, -1).join(", ")} e {nomesEmPausa[nomesEmPausa.length - 1]}{" "}
                  param a partir de {dataCurtaDe(inicioPausa)} e só voltam quando o médico liberar —
                  aí é só desmarcar a cirurgia aqui ou tirar a data.
                </p>
              </div>
            )}

            {contagem.data && (
              <Button
                variant="ghost"
                size="sm"
                disabled={carregando}
                className="text-ink-muted"
                onClick={() => editar({ contagem: { data: null, titulo: "", cirurgia: false } })}
              >
                <Trash2 className="h-4 w-4" /> Tirar a data
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Peso -------------------------------------------------------------- */}
        <Card>
          <CardHeader>
            <Eyebrow className="text-brand">Balança</Eyebrow>
            <CardTitle className="mt-1.5 flex items-center gap-2">
              <Scale className="h-4.5 w-4.5 text-brand" /> Peso
            </CardTitle>
            <CardDescription>
              O peso de partida só vale enquanto não houver pesagem registrada —
              com pesagens, a referência é a primeira delas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GrupoCampos>
              <LinhaCampo rotulo="Peso inicial" detalhe="kg">
                <Input
                  disabled={carregando}
                  inputMode="decimal"
                  value={String(atual.pesoInicial).replace(".", ",")}
                  onChange={(e) =>
                    editar({
                      pesoInicial: Number(e.target.value.replace(",", ".")) || 0,
                    })
                  }
                  className={cn(CAMPO_NA_LINHA, "w-22")}
                />
              </LinhaCampo>
              <LinhaCampo rotulo="Meta" detalhe="kg">
                <Input
                  disabled={carregando}
                  inputMode="decimal"
                  value={String(atual.pesoMeta).replace(".", ",")}
                  onChange={(e) =>
                    editar({
                      pesoMeta: Number(e.target.value.replace(",", ".")) || 0,
                    })
                  }
                  className={cn(CAMPO_NA_LINHA, "w-22")}
                />
              </LinhaCampo>
            </GrupoCampos>
          </CardContent>
        </Card>

        {/* Rotina ------------------------------------------------------------ */}
        <Card>
          <CardHeader>
            <Eyebrow className="text-plum">Rotina</Eyebrow>
            <CardTitle className="mt-1.5 flex items-center gap-2">
              <ListChecks className="h-4.5 w-4.5 text-plum" /> Blocos e itens
            </CardTitle>
            <CardDescription>
              Manhã, movimento, acompanhamento, noite — tudo editável, com blocos
              novos se quiser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/rotina">
                Editar a rotina <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Conta -------------------------------------------------------------- */}
        <Card>
          <CardHeader>
            <Eyebrow className="text-ink-muted">Conta</Eyebrow>
            <CardTitle className="mt-1.5">Acesso</CardTitle>
            <CardDescription>
              {sessao ? emailDaSessao(sessao) : "—"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => sair()}>
              <LogOut className="h-4 w-4" /> Sair desta conta
            </Button>
          </CardContent>
        </Card>

        <ResetCard />

        {/* Padrão de fábrica: longe da barra de salvar, para não ser tocado sem querer. */}
        <div className="flex justify-center">
          <Button
            disabled={carregando}
            variant="ghost"
            className="text-ink-muted"
            onClick={async () => {
              if (!confirm("Voltar todos os ajustes para o padrão?")) return;
              await restaurar();
              setRascunho(null);
            }}
          >
            <RotateCcw className="h-4 w-4" /> Voltar os ajustes ao padrão
          </Button>
        </div>
      </div>

      {/* Salvar: barra fixa logo acima do dock, só com alteração (ou com o
          "salvo" de confirmação). Sólida, para nada aparecer por baixo. Fica
          fora da escada de entrada (.stagger): animação com transform num
          ancestral tiraria o position: fixed do lugar. */}
      {(mudou || salvo) && (
        <div data-barra-fixa className="barra-acima-do-dock animate-rise">
          <div
            role={mudou ? undefined : "status"}
            className="mx-auto flex max-w-3xl items-center gap-2 rounded-full border border-line bg-surface p-1.5 shadow-[0_18px_40px_-18px_rgba(25,21,18,0.55)]"
          >
            {mudou ? (
              <>
                <Button variant="outline" onClick={() => setRascunho(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={aplicar}
                  disabled={carregando || !tudoOk}
                  // Desativado (algum campo em vermelho): cinza e legível, não translúcido.
                  className="flex-1 disabled:bg-line-soft disabled:text-ink-muted disabled:opacity-100 disabled:shadow-none"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {tudoOk ? "Salvar ajustes" : "Corrija os avisos"}
                </Button>
              </>
            ) : (
              <p className="flex h-11 flex-1 items-center justify-center gap-1.5 text-sm font-bold text-brand">
                <CheckCircle2 className="h-4 w-4" /> Ajustes salvos
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/** Uma escolha liga/desliga com título e explicação — o toque no texto também marca. */
function Opcao({
  marcado,
  desativado,
  onMudar,
  titulo,
  detalhe,
}: {
  marcado: boolean;
  desativado?: boolean;
  onMudar: (valor: boolean) => void;
  titulo: string;
  detalhe: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl2 border p-3.5 transition",
        marcado ? "border-brand/20 bg-brand-soft/50" : "border-line bg-surface",
        desativado && "cursor-not-allowed opacity-60",
      )}
    >
      <Checkbox
        checked={marcado}
        disabled={desativado}
        onCheckedChange={(v) => onMudar(v === true)}
        className="mt-0.5"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">{titulo}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{detalhe}</span>
      </span>
    </label>
  );
}

/**
 * Uma linha de "Horários dos remédios": o nome, a hora que vale e, quando a
 * hora é dela, a do app embaixo e o "Voltar ao padrão". A linha é sempre
 * <div> (por isso o rodapé vai sempre, mesmo vazio): o botão aparece no meio
 * da escolha, e trocar <label> por <div> nessa hora recriaria o campo e
 * fecharia o seletor de hora do iPhone. O nome continua abrindo o campo,
 * pelo <label> só em volta dele.
 */
function LinhaHorarioRemedio({
  s,
  prefs,
  emPausa,
  desativado,
  onMudar,
}: {
  s: Supplement;
  /** As preferências na tela, com o rascunho. */
  prefs: Preferencias;
  emPausa: boolean;
  desativado: boolean;
  /** A hora nova do item; `null` volta para a do app. */
  onMudar: (hora: string | null) => void;
}) {
  const id = useId();
  const padrao = horarioPadraoDoSuplemento(s, prefs);
  const comoPadrao = descreverHorarioPadrao(s);
  // O valor do rascunho como ela deixou — até vazio ou antes das 05:00 —,
  // para o campo mostrar o que ela pôs, com o erro embaixo.
  const escolhido = prefs.horariosRemedios[s.id] as string | undefined;
  const invalido = escolhido !== undefined && !ehHoraRemedioValida(escolhido);
  const dela = invalido || horarioFoiEditado(s, prefs);
  const dias = ehSemanal(s) && s.dias ? ` · ${s.dias.map((d) => NOMES_DIAS[d]).join(" e ")}` : "";

  return (
    <LinhaCampo
      rotulo={
        // Em linha que quebra, com espaço entre os dois: o selo que desce
        // para a linha de baixo fica alinhado com o nome, sem recuo.
        <label htmlFor={id} className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span>
            {s.curto}
            {dias}
          </span>
          {emPausa && (
            <span className="rounded-full bg-line-soft px-1.5 text-[0.625rem] leading-4 font-bold text-ink-muted">
              em pausa
            </span>
          )}
        </label>
      }
      detalhe={
        dela ? (
          <>
            Padrão do app: {padrao ?? "—"}
            {/* O parêntese desce inteiro para a linha de baixo, em vez de
                quebrar no meio ("(depois / do almoço)"). */}
            {comoPadrao && (
              <>
                {" "}
                <span className="inline-block">({comoPadrao})</span>
              </>
            )}
          </>
        ) : (
          comoPadrao
        )
      }
      rodape={
        <>
          {invalido && (
            <span className="mt-1 block text-xs font-semibold leading-snug text-danger">
              Escolha um horário entre 05:00 e 23:59.
            </span>
          )}
          {dela && (
            // 44 px de altura para o dedo; a margem negativa come o respiro de
            // baixo da linha, que a altura extra já cobre.
            <button
              type="button"
              disabled={desativado}
              onClick={() => onMudar(null)}
              className="-mb-2 inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-clay transition hover:text-ink disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Voltar ao padrão
            </button>
          )}
        </>
      }
    >
      <Input
        id={id}
        disabled={desativado}
        type="time"
        aria-invalid={invalido || undefined}
        value={escolhido ?? padrao ?? ""}
        onChange={(e) => onMudar(e.target.value)}
        className={cn(CAMPO_NA_LINHA, "w-22")}
      />
    </LinhaCampo>
  );
}
