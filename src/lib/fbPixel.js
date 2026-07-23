// Cliente do Meta Pixel: carrega o script oficial e expõe helpers de tracking.
// As credenciais vêm de variáveis de ambiente (.env), nunca hardcoded no código.

const PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID;

const isConfigured = !!PIXEL_ID;

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${days * 86400}; path=/; SameSite=Lax`;
}

// Fallback próprio para o _fbc: o fbevents.js já faz isso sozinho quando lê o
// fbclid da URL, mas isso depende do timing do carregamento do script. Setar
// via cookie first-party aqui garante que o clique não se perca caso o
// script do Facebook demore a carregar ou a página seja abandonada antes.
function ensureFbc() {
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  if (!fbclid || getCookie("_fbc")) return;
  setCookie("_fbc", `fb.1.${Date.now()}.${fbclid}`, 90);
}

export function getFbclid() {
  return new URLSearchParams(window.location.search).get("fbclid");
}

export function getFbc() {
  return getCookie("_fbc");
}

export function getFbp() {
  return getCookie("_fbp");
}

export function generateEventId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function initPixel() {
  if (!isConfigured || typeof window === "undefined") return;

  ensureFbc();

  if (window.fbq) return;

  (function (f, b, e, v) {
    var n = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    var t = b.createElement(e);
    t.async = true;
    t.src = v;
    var s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
}

export function trackStep(stepName, stepIndex) {
  if (!isConfigured || !window.fbq) return;
  window.fbq("trackCustom", "FunnelStep", { step: stepName, step_index: stepIndex });
}

// eventId permite dedupe (ex: se um dia existir CAPI server-side enviando o
// mesmo Lead, ou se o usuário clicar duas vezes) via 4º parâmetro do fbq.
export function trackLead(payload, eventId) {
  if (!isConfigured || !window.fbq) return;
  window.fbq("track", "Lead", payload, eventId ? { eventID: eventId } : undefined);
}
