// Cliente Supabase "leve": usa a REST API diretamente via fetch,
// sem depender do pacote @supabase/supabase-js.
// As credenciais vêm de variáveis de ambiente (.env), nunca hardcoded no código.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  !!SUPABASE_URL &&
  !!SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("SEU-PROJETO");

export async function saveLead(payload) {
  if (!isConfigured) {
    console.warn(
      "Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env"
    );
    return { ok: false, reason: "not-configured" };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Supabase insert error:", res.status, text);
      return { ok: false, reason: text };
    }

    return { ok: true };
  } catch (e) {
    console.error("Supabase network error:", e);
    return { ok: false, reason: String(e) };
  }
}
