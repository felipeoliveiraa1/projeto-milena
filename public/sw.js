/*
 * Service worker do Mais Leve — só notificações.
 *
 * Não tem handler de fetch nem cache de propósito: o app continua sempre
 * buscando a versão nova na rede, como antes. Este arquivo existe para o
 * celular conseguir receber os lembretes de remédio e de água com o app
 * fechado (no iPhone, só com o app instalado na Tela de Início, iOS 16.4+).
 *
 * Quem manda os lembretes é app/api/lembretes; o formato do aviso é
 * { title, body, tag, url }.
 */

self.addEventListener("install", () => {
  // Versão nova assume na hora, sem esperar todas as abas fecharem.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/** Só caminhos do próprio app ("/rotina"); qualquer outra coisa vira "/". */
function caminhoSeguro(url) {
  if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//")) return "/";
  return url;
}

function lerAviso(event) {
  if (!event.data) return {};
  try {
    const dados = event.data.json();
    return dados && typeof dados === "object" ? dados : {};
  } catch {
    // Veio texto puro: vira o corpo do aviso.
    try {
      return { body: event.data.text() };
    } catch {
      return {};
    }
  }
}

self.addEventListener("push", (event) => {
  const dados = lerAviso(event);
  const titulo =
    typeof dados.title === "string" && dados.title.trim() ? dados.title : "Mais Leve";
  const opcoes = {
    body: typeof dados.body === "string" ? dados.body : "",
    icon: "/icon",
    badge: "/icon",
    data: { url: caminhoSeguro(dados.url) },
  };
  if (typeof dados.tag === "string" && dados.tag) opcoes.tag = dados.tag;

  // Sempre mostrar um aviso: o iPhone corta a inscrição de quem recebe push
  // e não mostra nada.
  event.waitUntil(self.registration.showNotification(titulo, opcoes));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const caminho = caminhoSeguro(event.notification.data && event.notification.data.url);
  const destino = new URL(caminho, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const janelas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const janela of janelas) {
        if (new URL(janela.url).origin !== self.location.origin) continue;
        try {
          const focada = await janela.focus();
          if (focada.url !== destino && "navigate" in focada) await focada.navigate(destino);
          return;
        } catch {
          // Janela que não deixa navegar (ainda sem este service worker): abre outra.
        }
      }
      await self.clients.openWindow(destino);
    })(),
  );
});
