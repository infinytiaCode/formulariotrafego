// Chama a Supabase Edge Function que envia o evento para a CAPI do Meta.
// O access token do Meta fica só no servidor (secret da function) — aqui só
// usamos as mesmas credenciais públicas do Supabase (anon key) já usadas em
// saveLead().

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !SUPABASE_URL.includes("SEU-PROJETO");

export async function sendCapiEvent({ eventId, phone, fbc, fbp }) {
  if (!isConfigured) return { ok: false, reason: "not-configured" };

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/super-function`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        event_id: eventId,
        event_source_url: window.location.href,
        phone,
        fbc,
        fbp,
      }),
    });

    if (!res.ok) {
      console.error("CAPI edge function error:", res.status, await res.text());
      return { ok: false };
    }

    return { ok: true };
  } catch (e) {
    console.error("CAPI network error:", e);
    return { ok: false, reason: String(e) };
  }
}
