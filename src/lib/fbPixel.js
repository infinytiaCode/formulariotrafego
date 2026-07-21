// Cliente do Meta Pixel: carrega o script oficial e expõe helpers de tracking.
// As credenciais vêm de variáveis de ambiente (.env), nunca hardcoded no código.

const PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID;

const isConfigured = !!PIXEL_ID;

export function initPixel() {
  if (!isConfigured || typeof window === "undefined" || window.fbq) return;

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

export function trackLead(payload) {
  if (!isConfigured || !window.fbq) return;
  window.fbq("track", "Lead", payload);
}
