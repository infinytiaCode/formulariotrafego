import { useEffect, useState } from "react";
import { C, STEPS } from "./constants.js";
import { fetchEvents } from "./lib/analytics.js";

const STEP_LABELS = {
  welcome: "Boas-vindas",
  contacts: "Quantidade de contatos",
  "who-answers": "Quem responde",
  "lost-client": "Já perdeu cliente",
  "after-hours": "Fora do horário",
  stat: "Estatística",
  "would-help": "Ajudaria?",
  "social-proof": "Prova social",
  features: "Funcionalidades",
  revenue: "Faturamento",
  final: "Formulário final",
};

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
          <Funnel counts={stepCounts} />
        </div>
      </div>
    </div>
  );
}
