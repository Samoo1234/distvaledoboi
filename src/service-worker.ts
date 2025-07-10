/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// Este service worker pode ser personalizado!
// Veja https://developers.google.com/web/tools/workbox/modules
// para a API do workbox.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Precache todos os ativos gerados pela compilação do webpack
// O createHandlerBoundToURL() cuida da navegação de aplicativo de página única (SPA)
precacheAndRoute(self.__WB_MANIFEST);

// Configurar o tratamento de navegação de app
// Serve o index.html para todas as requisições de navegação
const fileExtensionRegexp = /\/[^/?]+\.[^/]+$/;
registerRoute(
  // Retorna false para ignorar todas as requisições que não são para um URL de navegação
  ({ request, url }: { request: Request; url: URL }) => {
    if (request.mode !== 'navigate') {
      return false;
    }
    if (url.pathname.startsWith('/_')) {
      return false;
    }
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Estratégia para API e imagens - Stale While Revalidate
registerRoute(
  ({ url }) => 
    url.origin === self.location.origin && 
    (url.pathname.endsWith('.png') || 
     url.pathname.endsWith('.jpg') || 
     url.pathname.endsWith('.jpeg') ||
     url.pathname.startsWith('/api')),
  new StaleWhileRevalidate({
    cacheName: 'images-and-api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
);

// Este permite que o app funcione offline e carregue mais rápido
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Qualquer outra personalização pode ser feita aqui.
