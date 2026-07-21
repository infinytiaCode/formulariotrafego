import { useState, useEffect } from "react";
import { C } from "../constants.js";
import logo from "../assets/logo.png";

export function ProgressBar({ index, total }) {
  const pct = Math.max(6, Math.round(((index + 1) / total) * 100));
  return (
    <div
      style={{
        width: "100%",
        height: 6,
        borderRadius: 999,
        background: C.panel,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${C.primaryDark}, ${C.primaryLight})`,
          transition: "width 500ms cubic-bezier(.4,0,.2,1)",
          boxShadow: `0 0 12px ${C.primaryLight}66`,
        }}
      />
    </div>
  );
}


export function Logo({ height = 44 }) {
  return (
    <img
      src={logo}
      alt="Infinyt.IA"
      style={{
        height,
        width: "auto",
        borderRadius: 10,
        display: "block",
      }}
    />
  );
}


export function PrimaryButton({ children, onClick, disabled, icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "16px 20px",
        borderRadius: 14,
        border: "none",
        background: disabled
          ? C.panel
          : `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
        color: disabled ? C.mutedDark : "#fff",
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600,
        fontSize: 16,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : `0 8px 24px ${C.primary}55`,
        transition: "transform 150ms ease, box-shadow 150ms ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.98)")}
      onMouseUp={(e) => !disabled && (e.currentTarget.style.transform = "scale(1)")}
    >
      {icon} {children}
    </button>
  );
}


export function OptionCard({ label, selected, onClick, tone }) {
  const toneColor = tone === "success" ? C.success : tone === "danger" ? C.danger : null;
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "16px 18px",
        borderRadius: 14,
        border: `1.5px solid ${selected ? C.primaryLight : C.panelBorder}`,
        background: selected ? "rgba(124,108,255,0.10)" : "#FFFFFF",
        boxShadow: selected ? "none" : "0 1px 3px rgba(23,18,51,0.05)",
        color: C.text,
        fontFamily: "'Inter', sans-serif",
        fontSize: 15.5,
        fontWeight: 500,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transition: "all 150ms ease",
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          minWidth: 20,
          borderRadius: "50%",
          border: `2px solid ${selected ? C.primaryLight : C.mutedDark}`,
          background: selected ? C.primaryLight : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && (
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.bg }} />
        )}
      </span>
      {toneColor && (
        <span style={{ color: toneColor, fontWeight: 700 }}>
          {tone === "success" ? "✓" : "✕"}
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}


export function Fade({ children, k }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(false);
    const t = setTimeout(() => setShow(true), 30);
    return () => clearTimeout(t);
  }, [k]);
  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 400ms ease, transform 400ms ease",
      }}
    >
      {children}
    </div>
  );
}


export function WhatsAppMock({ variant }) {
  const bubbleBase = {
    padding: "10px 14px",
    borderRadius: 14,
    fontSize: 13.5,
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.45,
    maxWidth: "82%",
  };
  const receivedBubble = { ...bubbleBase, background: "#2A2153", color: "#FFFFFF" };
  const sentBubble = { ...bubbleBase, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#FFFFFF" };

  return (
    <div
      style={{
        borderRadius: 18,
        overflow: "hidden",
        border: `1px solid ${C.panelBorder}`,
        background: "#0E0B1E",
        boxShadow: "0 4px 20px rgba(23,18,51,0.10)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "#171030",
          borderBottom: "1px solid #2A2153",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
          }}
        />
        <span style={{ color: "#FFFFFF", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600 }}>
          {variant === "lost" ? "Luciana Cliente" : variant === "demo" ? "Infinyt" : "Sua clínica"}
        </span>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {variant === "lost" && (
          <>
            <div style={{ ...receivedBubble, alignSelf: "flex-start", borderTopLeftRadius: 2 }}>
              Bom dia! Quero agendar o Full Face
            </div>
            <div style={{ ...sentBubble, alignSelf: "flex-end", borderTopRightRadius: 2 }}>
              Boa noite, desculpe a demora. Ainda quer fazer?
            </div>
            <div style={{ ...receivedBubble, alignSelf: "flex-start", borderTopLeftRadius: 2 }}>
              Já fechei com outra clínica 😕
            </div>
          </>
        )}
        {variant === "normal" && (
          <>
            <div style={{ ...receivedBubble, alignSelf: "flex-start", borderTopLeftRadius: 2 }}>
              Oi! Vi no Instagram, quero saber o valor do botox
            </div>
            <div style={{ ...sentBubble, alignSelf: "flex-end", borderTopRightRadius: 2 }}>
              Oi! Eu sou a assistente da clínica 💜 Já te explico tudo e vejo os horários livres
            </div>
          </>
        )}
        {variant === "demo" && (
          <>
            <div style={{ ...receivedBubble, alignSelf: "flex-start", borderTopLeftRadius: 2 }}>
              Oi! Meu nome é Lucas e estou com bastante dor no dente. Será que consigo marcar uma consulta?
            </div>
            <div style={{ ...sentBubble, alignSelf: "flex-end", borderTopRightRadius: 2 }}>
              Olá Lucas! Entendo que essa dor pode ser bem desconfortável, vamos resolver isso o quanto antes 💜 Tenho estes horários: terça às 10h, quarta às 16h ou quinta às 13h.
            </div>
            <div style={{ ...receivedBubble, alignSelf: "flex-start", borderTopLeftRadius: 2 }}>
              Pode ser terça de manhã!
            </div>
            <div style={{ ...sentBubble, alignSelf: "flex-end", borderTopRightRadius: 2 }}>
              Perfeito! Consulta confirmada para terça-feira às 10h com a Dra. Maria. Nos vemos em breve 😊
            </div>
          </>
        )}
      </div>
    </div>
  );
}


export function FeatureCard({ children }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: `1px solid ${C.panelBorder}`,
        borderRadius: 14,
        padding: "16px 14px",
        color: C.text,
        fontSize: 13.5,
        fontFamily: "'Inter', sans-serif",
        lineHeight: 1.4,
        boxShadow: "0 1px 4px rgba(23,18,51,0.05)",
      }}
    >
      {children}
    </div>
  );
}


export function ComparisonRow({ label, oldValue, newValue }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        padding: "12px 0",
        borderBottom: `1px solid ${C.panelBorder}`,
      }}
    >
      <div style={{ gridColumn: "1 / -1", color: C.mutedDark, fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
        {label}
      </div>
      <div style={{ color: C.danger, fontSize: 13, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
        <span>✕</span> {oldValue}
      </div>
      <div style={{ color: C.success, fontSize: 13, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
        <span>✓</span> {newValue}
      </div>
    </div>
  );
}

