// Service worker mínimo do Família no Azul.
//
// Objetivo ÚNICO: tornar o app instalável. O Chrome no Android só dispara o
// evento `beforeinstallprompt` (a instalação nativa em 1 toque) quando existe
// um service worker registrado com um handler de `fetch`. Sem isso, o app cai
// sempre no guia de instalação manual.
//
// De propósito NÃO fazemos cache de assets: o handler de fetch é um no-op
// (não chama respondWith), então tudo passa direto pra rede. Assim o app nunca
// serve uma versão velha depois de um deploy — offline fica pra uma fase futura.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Passthrough: a presença deste handler é o que habilita a instalação.
  // Não interceptamos nem cacheamos nada.
});
