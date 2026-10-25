"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { RotinaItem } from "@/data/protocol";
import { CheckRow } from "@/components/check-row";
import { cn } from "@/lib/utils";

/**
 * Item da rotina. Quando o item tem `campo: "texto"`, aparece uma caixa de
 * digitação salva por dia — usada na gratidão e nos sintomas.
 * O texto salva sozinho, 700 ms depois da última tecla. Quem salva pode
 * devolver `false` quando a gravação não deu — aí o selo "salvo" não aparece.
 *
 * Com `campo: "escolha"`, as `opcoes` viram botões embaixo do texto (o Sim e
 * o Não do "Evacuou hoje?"), gravados pelo mesmo `onSalvarTexto` — ver
 * EscolhaDoDia. O checkbox sozinho continua só marcando e desmarcando.
 */
export function RotinaItemRow({
  item,
  checked,
  onToggle,
  texto,
  onSalvarTexto,
  bloqueado = false,
  naoSalvo,
  tom = "plum",
}: {
  item: RotinaItem;
  checked: boolean;
  onToggle: () => void;
  texto?: string;
  onSalvarTexto?: (valor: string) => void | Promise<boolean | void>;
  /**
   * O dia ainda não carregou (ou a leitura falhou): a caixa fica travada. Se
   * ela digitasse antes de o texto salvo chegar, a gravação apagaria o que já
   * estava lá sem ela nem ter visto.
   */
  bloqueado?: boolean;
  /** Texto que ela digitou nesse dia e não gravou (ver textoNaoSalvo em lib/storage.ts). */
  naoSalvo?: string;
  tom?: "plum" | "brand";
}) {
  const [valor, setValor] = useState(naoSalvo ?? texto ?? "");
  const [salvo, setSalvo] = useState(false);
  // Depois que ela mexe na caixa, o texto dela é que vale: o que volta do
  // banco (o eco das gravações, que pode chegar fora de ordem com a rede
  // lenta) não sobrescreve o que ela continuou digitando. Cada dia tem a sua
  // caixa — quem usa põe o dia na key —, então isto não passa de um dia a outro.
  // Um texto que não gravou conta como mexido: ele é que vale e tenta de novo.
  const [mexeu, setMexeu] = useState(naoSalvo !== undefined);
  const textoExterno = texto ?? "";
  // A caixa e a gravação sozinha são só do "texto": a resposta da "escolha"
  // grava no toque, e nunca por um temporizador.
  const ehTexto = item.campo === "texto";

  // O erro da gravação chegou depois de a caixa montar: ela passa a mostrar o
  // texto que não gravou (se ela ainda não tinha digitado de novo).
  const [naoSalvoVisto, setNaoSalvoVisto] = useState(naoSalvo);
  if (naoSalvo !== naoSalvoVisto) {
    setNaoSalvoVisto(naoSalvo);
    if (naoSalvo !== undefined && !mexeu) {
      setValor(naoSalvo);
      setMexeu(true);
    }
  }

  // Ajuste de estado durante o render (padrão do React para "prop mudou"):
  // quando o dia termina de carregar do banco, a caixa recebe o texto salvo.
  const [textoAnterior, setTextoAnterior] = useState(textoExterno);
  if (textoExterno !== textoAnterior) {
    setTextoAnterior(textoExterno);
    if (!mexeu) setValor(textoExterno);
  }

  function digitar(novo: string) {
    setMexeu(true);
    setValor(novo);
  }

  // A função de salvar vive numa ref para o temporizador não reiniciar toda vez
  // que o componente pai renderiza.
  const salvarRef = useRef(onSalvarTexto);
  useEffect(() => {
    salvarRef.current = onSalvarTexto;
  });

  useEffect(() => {
    // Igual ao que já está salvo: nada a fazer (inclusive na primeira carga).
    // Travada, também não: o texto do banco ainda não chegou para comparar.
    if (!ehTexto || !salvarRef.current || bloqueado || valor === textoExterno) return;
    const t = setTimeout(() => {
      void Promise.resolve(salvarRef.current?.(valor)).then((resultado) => {
        if (resultado === false) return;
        setSalvo(true);
        setTimeout(() => setSalvo(false), 1600);
      });
    }, 700);
    return () => clearTimeout(t);
  }, [ehTexto, valor, textoExterno, bloqueado]);

  const pendenteRef = useRef<{ valor: string; externo: string; ehTexto: boolean }>({
    valor,
    externo: textoExterno,
    ehTexto,
  });
  useEffect(() => {
    pendenteRef.current = { valor, externo: textoExterno, ehTexto };
  });
  useEffect(
    () => () => {
      const { valor: ultimo, externo, ehTexto: daCaixa } = pendenteRef.current;
      if (daCaixa && salvarRef.current && ultimo !== externo) void salvarRef.current(ultimo);
    },
    [],
  );

  const corAtiva = tom === "brand" ? "border-brand/20 bg-brand-soft/50" : "border-plum/20 bg-plum-soft/60";

  return (
    <div className="space-y-2">
      <CheckRow
        checked={checked}
        onToggle={onToggle}
        label={item.texto}
        className={checked ? corAtiva : undefined}
      >
        <span
          className={cn(
            "block text-sm font-medium",
            checked ? "text-ink-muted line-through" : "text-ink",
          )}
        >
          {item.texto}
        </span>
        {item.detalhe && (
          <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
            {item.detalhe}
          </span>
        )}
        {item.campo === "escolha" && onSalvarTexto && item.opcoes && item.opcoes.length > 0 && (
          <EscolhaDoDia
            opcoes={item.opcoes}
            pergunta={item.detalhe ?? item.texto}
            resposta={textoExterno}
            checked={checked}
            onToggle={onToggle}
            onSalvar={onSalvarTexto}
            bloqueado={bloqueado}
          />
        )}
      </CheckRow>

      {ehTexto && onSalvarTexto && (
        <div className="ml-1 space-y-2 border-l-2 border-line pl-3">
          {item.opcoes && item.opcoes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.opcoes.map((o) => {
                const ativo = valor.trim() === o;
                return (
                  <button
                    key={o}
                    type="button"
                    disabled={bloqueado}
                    onClick={() => digitar(ativo ? "" : o)}
                    className={cn(
                      "inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold transition",
                      ativo
                        ? "border-plum bg-plum text-bone"
                        : "border-line bg-surface text-ink-muted hover:border-plum/40 hover:text-ink",
                    )}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          )}

          <div className="relative">
            <textarea
              value={valor}
              onChange={(e) => digitar(e.target.value)}
              placeholder={bloqueado ? "carregando…" : item.placeholder}
              disabled={bloqueado}
              rows={item.opcoes ? 2 : 3}
              // 16 px: abaixo disso o iPhone dá zoom ao tocar na caixa.
              className="block w-full resize-y appearance-none rounded-xl2 border border-line bg-surface px-3.5 py-2.5 text-base leading-relaxed text-ink transition placeholder:text-ink-muted focus-visible:border-plum/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-plum/10 disabled:opacity-60"
            />
            {salvo && (
              <span className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[0.625rem] font-bold text-brand">
                <Check className="h-3 w-3" /> salvo
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * As respostas de um item com `campo: "escolha"`, um botão para cada uma.
 * Tocar numa resposta grava o texto do dia e marca o item, se ainda não
 * estava; tocar de novo na escolhida apaga a resposta e desmarca. O botão
 * acende na hora e, se a gravação não der, volta ao que está gravado — o
 * aviso de "não salvou" aparece pela tela que usa o item, como nos checks.
 */
function EscolhaDoDia({
  opcoes,
  pergunta,
  resposta,
  checked,
  onToggle,
  onSalvar,
  bloqueado,
}: {
  opcoes: string[];
  /** Nome do grupo de botões para o leitor de tela ("Evacuou hoje?"). */
  pergunta: string;
  /** A resposta gravada no dia; "" sem resposta. */
  resposta: string;
  checked: boolean;
  onToggle: () => void;
  onSalvar: (valor: string) => void | Promise<boolean | void>;
  bloqueado: boolean;
}) {
  // A resposta do último toque enquanto a gravação não volta. Só o último
  // toque decide: com a rede lenta, a volta de um toque antigo não apaga a
  // resposta nova da tela.
  const [pendente, setPendente] = useState<string | null>(null);
  const toques = useRef(0);
  const escolhida = pendente ?? resposta.trim();

  function tocar(opcao: string) {
    const nova = escolhida === opcao ? "" : opcao;
    const toque = ++toques.current;
    setPendente(nova);
    // Responder marca o item — o "Não" também: ela observou. Apagar a
    // resposta desmarca. O check que já está como deve ficar não é tocado.
    if ((nova !== "") !== checked) onToggle();
    void Promise.resolve(onSalvar(nova)).then(() => {
      // Gravou: a resposta que volta do banco já é a nova. Não gravou: a
      // tela volta à resposta gravada.
      if (toques.current === toque) setPendente(null);
    });
  }

  return (
    <div role="group" aria-label={pergunta} className="mt-2.5 flex flex-wrap gap-2">
      {opcoes.map((o) => {
        const ativo = escolhida === o;
        return (
          <button
            key={o}
            type="button"
            disabled={bloqueado}
            aria-pressed={ativo}
            onClick={(e) => {
              // O toque é na resposta: sem isto, a linha inteira alternaria o
              // check junto.
              e.stopPropagation();
              tocar(o);
            }}
            // 36 px na tela e 44 px para o dedo: o ::after estende o toque
            // 4 px para cima e para baixo, sem mudar o espaço da linha.
            className={cn(
              "relative inline-flex h-9 min-w-16 items-center justify-center rounded-full border px-4 text-sm font-semibold transition after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] disabled:opacity-50",
              ativo
                ? "border-plum bg-plum text-bone"
                : "border-line bg-surface text-ink-soft hover:border-plum/40 hover:text-ink",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
