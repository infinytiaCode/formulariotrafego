import { useEffect, useState } from "react";
import { C, STEPS } from "./constants.js";
import { fetchEvents } from "./lib/analytics.js";

const STEP_LABELS = {
  welcome: "Boas-vindas",
  contacts: "Quantidade de contatos",
  "who-answers": "Quem responde",
  calculator: "Calculadora de reativação",
  "lost-client": "Já perdeu cliente",
  "after-hours": "Fora do horário",
  stat: "Estatística",
  "would-help": "Ajudaria?",
  revenue: "Faturamento",
  final: "Formulário final",
};

// Passos de texto livre: mostramos média/min/máx e os últimos valores digitados.
// Os demais passos com resposta têm opções fixas, então mostramos a distribuição.
const FREE_TEXT_STEPS = new Set(["contacts", "calculator"]);

function formatDuration(ms) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}min ${s % 60}s`;
}

const AUTH_KEY = "infinyt_dashboard_auth";
const PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD;

function mixColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bch = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bch})`;
}

function PasswordGate({ onSuccess }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (value === PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.panel }}>
      <form onSubmit={submit} style={{ background: "#fff", padding: 32, borderRadius: 16, border: `1px solid ${C.panelBorder}`, display: "flex", flexDirection: "column", gap: 12, width: 280 }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, color: C.text, margin: 0 }}>Dashboard</h1>
        <input
          type="password"
          autoFocus
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false); }}
          placeholder="Senha"
          style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${error ? C.danger : C.panelBorder}`, fontSize: 14 }}
        />
        {error && <span style={{ color: C.danger, fontSize: 13 }}>Senha incorreta</span>}
        <button type="submit" style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Entrar
        </button>
      </form>
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.panelBorder}`, borderRadius: 14, padding: "16px 18px", flex: 1, minWidth: 140 }}>
      <div style={{ color: C.muted, fontSize: 13 }}>{label}</div>
      <div style={{ color: C.text, fontSize: 26, fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>{value}</div>
    </div>
  );
}

function Funnel({ counts }) {
  const max = counts[0]?.count || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {counts.map((c, i) => {
        const pct = max ? (c.count / max) * 100 : 0;
        const color = mixColor(C.primary, C.primaryLight, i / Math.max(counts.length - 1, 1));
        const prev = counts[i - 1];
        const dropPct = prev && prev.count > 0 ? Math.round((1 - c.count / prev.count) * 100) : null;
        return (
          <div key={c.step}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.text, marginBottom: 4 }}>
              <span>{STEP_LABELS[c.step] || c.step}</span>
              <span style={{ color: C.muted }}>
                {c.count} {dropPct !== null && dropPct > 0 && <span style={{ color: C.danger }}>(−{dropPct}%)</span>}
              </span>
            </div>
            <div style={{ background: C.panel, borderRadius: 8, height: 18 }}>
              <div style={{ width: `${pct}%`, minWidth: pct > 0 ? 8 : 0, height: "100%", background: color, borderRadius: 8, transition: "width 0.3s" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExitPoints({ counts, total }) {
  const max = Math.max(...counts.map((c) => c.count), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {counts.map((c) => {
        const pct = max ? (c.count / max) * 100 : 0;
        const shareOfTotal = total > 0 ? Math.round((c.count / total) * 100) : 0;
        return (
          <div key={c.step}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.text, marginBottom: 4 }}>
              <span>{STEP_LABELS[c.step] || c.step}</span>
              <span style={{ color: C.muted }}>
                {c.count} {c.count > 0 && <span>({shareOfTotal}%)</span>}
              </span>
            </div>
            <div style={{ background: C.panel, borderRadius: 8, height: 18 }}>
              <div
                style={{
                  width: `${pct}%`,
                  minWidth: pct > 0 ? 8 : 0,
                  height: "100%",
                  background: c.step === "final" ? C.success : C.danger,
                  opacity: 0.75,
                  borderRadius: 8,
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AnswerBreakdown({ step, answers }) {
  if (FREE_TEXT_STEPS.has(step)) {
    const numbers = answers.map((a) => parseFloat(String(a).replace(/[^\d.,]/g, "").replace(",", "."))).filter((n) => !isNaN(n));
    const avg = numbers.length ? numbers.reduce((s, n) => s + n, 0) / numbers.length : null;
    const recent = answers.slice(-8).reverse();
    return (
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
          {STEP_LABELS[step] || step} <span style={{ color: C.muted, fontWeight: 400 }}>({answers.length} respostas)</span>
        </div>
        {avg !== null && (
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>
            Média: <b style={{ color: C.text }}>{avg.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</b>
            {" · "}Min: {Math.min(...numbers)} · Máx: {Math.max(...numbers)}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {recent.map((v, i) => (
            <span key={i} style={{ background: C.panel, borderRadius: 8, padding: "4px 10px", fontSize: 12.5, color: C.text }}>
              {v}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const counts = {};
  answers.forEach((a) => { counts[a] = (counts[a] || 0) + 1; });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = entries[0]?.[1] || 1;

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
        {STEP_LABELS[step] || step} <span style={{ color: C.muted, fontWeight: 400 }}>({answers.length} respostas)</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries.map(([label, count]) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.text, marginBottom: 3 }}>
              <span>{label}</span>
              <span style={{ color: C.muted }}>{count}</span>
            </div>
            <div style={{ background: C.panel, borderRadius: 6, height: 12 }}>
              <div style={{ width: `${(count / max) * 100}%`, minWidth: 6, height: "100%", background: C.primaryLight, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === "1");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!authed) return;
    fetchEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, [authed]);

  if (!PASSWORD) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        Defina VITE_DASHBOARD_PASSWORD no .env para acessar o dashboard.
      </div>
    );
  }

  if (!authed) return <PasswordGate onSuccess={() => setAuthed(true)} />;
  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Carregando…</div>;

  const totalSessions = new Set(events.map((e) => e.session_id)).size;
  const totalVisitors = new Set(events.map((e) => e.visitor_id).filter(Boolean)).size;

  const stepCounts = STEPS.map((step, index) => ({
    step,
    index,
    count: new Set(
      events.filter((e) => e.event === "step_view" && e.step_index === index).map((e) => e.session_id)
    ).size,
  }));

  const finalCount = stepCounts[stepCounts.length - 1].count;
  const conversionRate = totalSessions > 0 ? Math.round((finalCount / totalSessions) * 100) : 0;

  let worstDrop = { step: "-", pct: 0 };
  for (let i = 1; i < stepCounts.length; i++) {
    const prev = stepCounts[i - 1].count;
    const cur = stepCounts[i].count;
    if (prev > 0) {
      const pct = Math.round((1 - cur / prev) * 100);
      if (pct > worstDrop.pct) worstDrop = { step: STEP_LABELS[stepCounts[i].step] || stepCounts[i].step, pct };
    }
  }

  // Onde cada sessão parou de fato: o último passo visto por ela.
  const lastStepBySession = new Map();
  events
    .filter((e) => e.event === "step_view")
    .forEach((e) => {
      const cur = lastStepBySession.get(e.session_id);
      if (cur === undefined || e.step_index > cur) lastStepBySession.set(e.session_id, e.step_index);
    });
  const exitCounts = STEPS.map((step, index) => ({
    step,
    index,
    count: [...lastStepBySession.values()].filter((i) => i === index).length,
  }));

  // Tempo gasto em cada etapa: diferença de tempo entre visitas consecutivas
  // da mesma sessão (descarta gaps > 10min, provavelmente aba esquecida aberta).
  const durationsByStep = STEPS.map(() => []);
  const sessionsMap = new Map();
  events
    .filter((e) => e.event === "step_view")
    .forEach((e) => {
      if (!sessionsMap.has(e.session_id)) sessionsMap.set(e.session_id, []);
      sessionsMap.get(e.session_id).push(e);
    });
  sessionsMap.forEach((sessionEvents) => {
    const sorted = [...sessionEvents].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    for (let i = 1; i < sorted.length; i++) {
      const delta = new Date(sorted[i].created_at) - new Date(sorted[i - 1].created_at);
      if (delta > 0 && delta < 10 * 60 * 1000) durationsByStep[sorted[i - 1].step_index].push(delta);
    }
  });
  const avgTimeByStep = STEPS.map((step, index) => {
    const durations = durationsByStep[index];
    if (!durations.length) return null;
    return { step, index, avgMs: durations.reduce((s, d) => s + d, 0) / durations.length };
  }).filter(Boolean);

  // Respostas dadas em cada etapa (o que a pessoa digitou/escolheu).
  const answersByStep = {};
  events
    .filter((e) => e.event === "step_answer" && e.answer)
    .forEach((e) => {
      if (!answersByStep[e.step]) answersByStep[e.step] = [];
      answersByStep[e.step].push(e.answer);
    });

  return (
    <div style={{ minHeight: "100vh", background: C.panel, padding: "32px 20px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 22, color: C.text, margin: 0 }}>Acessos do funil</h1>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <StatTile label="Pessoas únicas" value={totalVisitors} />
          <StatTile label="Sessões totais" value={totalSessions} />
          <StatTile label="Chegaram ao final" value={finalCount} />
          <StatTile label="Taxa de conclusão" value={`${conversionRate}%`} />
          <StatTile label="Maior abandono" value={worstDrop.pct > 0 ? `${worstDrop.step} (−${worstDrop.pct}%)` : "-"} />
        </div>

        <div style={{ background: "#fff", border: `1px solid ${C.panelBorder}`, borderRadius: 16, padding: 20 }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, color: C.text, margin: "0 0 16px" }}>
            Sessões por etapa
          </h2>
          <p style={{ color: C.muted, fontSize: 12.5, margin: "-10px 0 16px" }}>
            Quantas sessões chegaram a ver cada etapa (acumulado).
          </p>
          <Funnel counts={stepCounts} />
        </div>

        <div style={{ background: "#fff", border: `1px solid ${C.panelBorder}`, borderRadius: 16, padding: 20 }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, color: C.text, margin: "0 0 16px" }}>
            Onde as pessoas pararam
          </h2>
          <p style={{ color: C.muted, fontSize: 12.5, margin: "-10px 0 16px" }}>
            Última etapa vista por cada sessão — se parou em "Formulário final", provavelmente converteu.
          </p>
          <ExitPoints counts={exitCounts} total={totalSessions} />
        </div>

        {avgTimeByStep.length > 0 && (
          <div style={{ background: "#fff", border: `1px solid ${C.panelBorder}`, borderRadius: 16, padding: 20 }}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, color: C.text, margin: "0 0 16px" }}>
              Tempo médio por etapa
            </h2>
            <p style={{ color: C.muted, fontSize: 12.5, margin: "-10px 0 16px" }}>
              Quanto tempo em média a pessoa fica em cada etapa antes de avançar. Etapas com tempo alto podem indicar dúvida ou dificuldade.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {avgTimeByStep.map(({ step, avgMs }) => (
                <div key={step} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.text }}>
                  <span>{STEP_LABELS[step] || step}</span>
                  <span style={{ color: C.muted }}>{formatDuration(avgMs)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(answersByStep).length > 0 && (
          <div style={{ background: "#fff", border: `1px solid ${C.panelBorder}`, borderRadius: 16, padding: 20 }}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, color: C.text, margin: "0 0 16px" }}>
              Respostas por etapa
            </h2>
            <p style={{ color: C.muted, fontSize: 12.5, margin: "-10px 0 16px" }}>
              O que as pessoas digitaram ou escolheram em cada pergunta.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {STEPS.filter((step) => answersByStep[step]).map((step) => (
                <AnswerBreakdown key={step} step={step} answers={answersByStep[step]} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
