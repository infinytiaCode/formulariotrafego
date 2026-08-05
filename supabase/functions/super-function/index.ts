// Supabase Edge Function: envia o evento "Lead" para a Conversions API (CAPI) do Meta.
// Roda no servidor (Deno), então o access token nunca é exposto ao navegador —
// diferente das variáveis VITE_*, que são embutidas no JS público no build.
//
// Secrets esperados (configurar via `supabase secrets set`):
//   META_PIXEL_ID
//   META_ACCESS_TOKEN

const PIXEL_ID = Deno.env.get("META_PIXEL_ID");
const ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
const GRAPH_API_VERSION = "v21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Leads são de clínicas brasileiras e o campo de telefone do funil não pede
// o DDI; a CAPI recomenda enviar o número completo (com código do país) para
// melhorar a taxa de correspondência (event match quality).
function normalizeBrazilPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length > 0 && digits.length <= 11) return `55${digits}`;
  return digits;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, reason: "method-not-allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.error("send-capi-event: META_PIXEL_ID/META_ACCESS_TOKEN não configurados");
    return new Response(JSON.stringify({ ok: false, reason: "not-configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { event_id, event_source_url, phone, fbc, fbp } = body ?? {};

    if (!event_id) {
      return new Response(JSON.stringify({ ok: false, reason: "missing-event-id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const userAgent = req.headers.get("user-agent") ?? undefined;

    const userData: Record<string, unknown> = {};
    if (phone) userData.ph = [await sha256Hex(normalizeBrazilPhone(phone))];
    if (fbc) userData.fbc = fbc;
    if (fbp) userData.fbp = fbp;
    if (clientIp) userData.client_ip_address = clientIp;
    if (userAgent) userData.client_user_agent = userAgent;

    const payload = {
      data: [
        {
          event_name: "Lead",
          event_time: Math.floor(Date.now() / 1000),
          // Mesmo event_id usado no pixel do navegador (fbq), para o Meta
          // deduplicar o evento de browser com o evento server-side.
          event_id,
          event_source_url,
          action_source: "website",
          user_data: userData,
        },
      ],
    };

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const result = await res.json();

    if (!res.ok) {
      console.error("Meta CAPI error:", result);
      return new Response(JSON.stringify({ ok: false, reason: result }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-capi-event error:", e);
    return new Response(JSON.stringify({ ok: false, reason: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
