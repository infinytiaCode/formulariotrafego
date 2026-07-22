// Analytics próprio: registra acessos e progresso no funil na tabela
// analytics_events do Supabase (mesma REST API "leve" usada em supabase.js).

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !SUPABASE_URL.includes("SEU-PROJETO");

const SESSION_KEY = "infinyt_session_id";
const VISITOR_KEY = "infinyt_visitor_id";

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// Persiste no localStorage (sobrevive entre abas/sessões) para identificar
// a mesma pessoa mesmo que ela entre no site várias vezes.
function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

async function sendEvent(payload) {
  if (!isConfigured) return;

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Analytics network error:", e);
  }
}

export function trackPageView() {
  sendEvent({ session_id: getSessionId(), visitor_id: getVisitorId(), event: "page_view" });
}

export function trackStepView(step, stepIndex) {
  sendEvent({
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    event: "step_view",
    step,
    step_index: stepIndex,
  });
}

// Registrado quando a pessoa clica em "Continuar", com o que ela
// respondeu/digitou naquela etapa (não captura texto digitado e depois
// abandonado sem confirmar, pra não disparar um evento a cada tecla).
export function trackStepAnswer(step, stepIndex, answer) {
  if (answer === undefined || answer === null || String(answer).trim() === "") return;
  sendEvent({
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    event: "step_answer",
    step,
    step_index: stepIndex,
    answer: String(answer).trim(),
  });
}

export async function fetchEvents() {
  if (!isConfigured) return [];

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/analytics_events?select=session_id,visitor_id,event,step,step_index,answer,created_at&order=created_at.asc`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );

  if (!res.ok) return [];
  return res.json();
}
