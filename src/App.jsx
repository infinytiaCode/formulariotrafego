import { useState, useEffect } from "react";
import {
  C,
  STEPS,
  WHATSAPP_NUMBER,
  CONTACTS_RANGES,
  LOST_CLIENT_OPTIONS,
  REVENUE_RANGES,
  DISQUALIFYING_REVENUE,
} from "./constants.js";
import { saveLead } from "./lib/supabase.js";
import { sendCapiEvent } from "./lib/capi.js";
import { initPixel, trackStep, trackLead, generateEventId, getFbclid, getFbc, getFbp } from "./lib/fbPixel.js";
import { trackPageView, trackStepView, trackStepAnswer } from "./lib/analytics.js";
import {
  ProgressBar,
  Logo,
  PrimaryButton,
  OptionCard,
  Fade,
  WhatsAppMock,
  DisqualifyModal,
} from "./components/UI.jsx";

const STEP_ANSWER_KEYS = {
  contacts: "contacts",
  "lost-client": "lostClient",
  revenue: "revenue",
};

export default function InfinytFunnel() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({
    contacts: "",
    lostClient: "",
    revenue: "",
  });
  const [leadName, setLeadName] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [showDisqualified, setShowDisqualified] = useState(false);

  const step = STEPS[stepIndex];
  const total = STEPS.length;

  useEffect(() => {
    initPixel();
    trackPageView();
  }, []);

  useEffect(() => {
    trackStep(step, stepIndex);
    trackStepView(step, stepIndex);
  }, [step, stepIndex]);

  const next = () => {
    const answerKey = STEP_ANSWER_KEYS[step];
    if (answerKey) trackStepAnswer(step, stepIndex, answers[answerKey]);

    // Lead desqualificado (faturamento muito baixo): interrompe o funil aqui.
    // Nunca chega no passo "final", então o pixel do Meta nunca recebe o
    // evento de Lead para essa pessoa.
    if (step === "revenue" && answers.revenue === DISQUALIFYING_REVENUE) {
      setShowDisqualified(true);
      return;
    }

    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));
  const setAnswer = (key, val) => setAnswers((a) => ({ ...a, [key]: val }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(false);

    // Dispara o Lead o quanto antes, antes de qualquer outra chamada de rede,
    // para dar ao pixel o máximo de tempo possível para enviar o beacon antes
    // do redirecionamento (browsers in-app do Instagram/Facebook podem matar
    // a página assim que o WhatsApp abre).
    const eventId = generateEventId();
    trackLead({ revenue_range: answers.revenue }, eventId);

    // Mesmo eventId enviado à CAPI (server-side) para o Meta deduplicar com o
    // evento que o pixel do navegador acabou de disparar acima.
    const [{ ok }] = await Promise.all([
      saveLead({
        name: leadName.trim(),
        company: leadCompany.trim(),
        phone: leadPhone.trim(),
        contacts: answers.contacts,
        lost_client: answers.lostClient,
        revenue_range: answers.revenue,
        fbclid: getFbclid(),
        fbc: getFbc(),
        fbp: getFbp(),
        event_id: eventId,
      }),
      sendCapiEvent({
        eventId,
        phone: leadPhone.trim(),
        fbc: getFbc(),
        fbp: getFbp(),
      }),
    ]);

    if (!ok) setSubmitError(true);

    const msg = "Olá quero agendar uma demonstração";
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

    // Pequeno atraso para garantir que o beacon do Lead já tenha saído do
    // navegador antes da troca de contexto (nova aba / deep link do app).
    setTimeout(() => {
      window.open(url, "_blank");
      setIsSubmitting(false);
    }, 250);
  };

  const canContinue = () => {
    if (step === "contacts") return !!answers.contacts;
    if (step === "lost-client") return !!answers.lostClient;
    if (step === "revenue") return !!answers.revenue;
    return true;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 16px",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: ${C.mutedDark}; }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 8px 24px ${C.primary}55; }
          50% { box-shadow: 0 8px 32px ${C.primary}CC, 0 0 0 6px ${C.primary}22; }
        }
        .pulse-btn { animation: pulseGlow 1.6s ease-in-out infinite; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 460, minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
          <Logo />
          {step !== "welcome" && <ProgressBar index={stepIndex} total={total} />}
        </div>

        {stepIndex > 0 && (
          <button
            onClick={back}
            style={{
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              padding: 0,
              color: C.muted,
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ← Voltar
          </button>
        )}

        <Fade k={step}>
          {step === "welcome" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "center", textAlign: "center" }}>
              <div
                style={{
                  background: C.panel,
                  border: `1px solid ${C.panelBorder}`,
                  borderRadius: 999,
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  color: C.text,
                  boxShadow: "0 1px 4px rgba(23,18,51,0.06)",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.success }} />
                Olá, eu sou a Infinyt!
              </div>

              <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 27, lineHeight: 1.3, color: C.text, margin: 0 }}>
                Sua clínica pode ter perdido mais de{" "}
                <span style={{ color: C.primaryLight }}>R$10.000</span> esse mês sem você nem saber
              </h1>

              <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.5, margin: 0 }}>
                A conta é simples e dói.
              </p>

              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                <PrimaryButton onClick={next} icon="🔥" pulse>
                  Quero recuperar esse dinheiro
                </PrimaryButton>
                <span style={{ color: C.mutedDark, fontSize: 13, textAlign: "center" }}>
                  Clique no botão
                </span>
              </div>
            </div>
          )}

          {step === "contacts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <WhatsAppMock variant="normal" />
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 21, color: C.text, textAlign: "center", margin: 0 }}>
                Quantos <span style={{ color: C.primaryLight }}>contatos</span> você recebe por mês no WhatsApp da sua clínica?
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {CONTACTS_RANGES.map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    selected={answers.contacts === opt}
                    onClick={() => setAnswer("contacts", opt)}
                  />
                ))}
              </div>
              <PrimaryButton onClick={next} disabled={!canContinue()}>
                Continuar
              </PrimaryButton>
            </div>
          )}

          {step === "lost-client" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <WhatsAppMock variant="lost" />
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 21, color: C.text, textAlign: "center", margin: 0 }}>
                Já aconteceu de perder uma cliente por causa da demora na resposta?
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {LOST_CLIENT_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    selected={answers.lostClient === opt}
                    onClick={() => setAnswer("lostClient", opt)}
                  />
                ))}
              </div>
              <PrimaryButton onClick={next} disabled={!canContinue()}>
                Continuar
              </PrimaryButton>
            </div>
          )}

          {step === "revenue" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 21, color: C.text, textAlign: "center", margin: 0 }}>
                Qual é o <span style={{ color: C.primaryLight }}>faturamento mensal</span> da sua clínica hoje?
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {REVENUE_RANGES.map((opt) => (
                  <OptionCard key={opt} label={opt} selected={answers.revenue === opt} onClick={() => setAnswer("revenue", opt)} />
                ))}
              </div>
              <PrimaryButton onClick={next} disabled={!canContinue()}>
                Continuar
              </PrimaryButton>
            </div>
          )}

          {step === "final" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 21, color: C.text, margin: 0 }}>
                  A experiência começa desde o primeiro contato no WhatsApp
                </h2>
                <p style={{ color: C.muted, fontSize: 14.5, margin: 0 }}>
                  A <span style={{ color: C.primaryLight, fontWeight: 600 }}>Infinyt</span> responde em segundos, vende e agenda por você!
                </p>
              </div>

              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: C.text, margin: 0 }}>
                  Sua Secretária Virtual
                </h3>
                <p style={{ color: C.primaryLight, fontWeight: 700, fontSize: 16, margin: 0 }}>
                  Especialista em Vendas!
                </p>
                <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                  Ficou interessada e quer saber mais? Preencha seus dados abaixo e envie uma mensagem para conversar com a Infinyt.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ color: C.text, fontSize: 13.5, fontWeight: 600 }}>Nome</label>
                  <input
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Digite seu nome..."
                    style={{
                      width: "100%",
                      padding: "16px 18px",
                      borderRadius: 14,
                      border: `1.5px solid ${C.panelBorder}`,
                      background: "#FFFFFF",
                      color: C.text,
                      fontSize: 15,
                      outline: "none",
                      boxShadow: "0 1px 3px rgba(23,18,51,0.05)",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ color: C.text, fontSize: 13.5, fontWeight: 600 }}>Nome da empresa</label>
                  <input
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    placeholder="Digite o nome da sua clínica/empresa..."
                    style={{
                      width: "100%",
                      padding: "16px 18px",
                      borderRadius: 14,
                      border: `1.5px solid ${C.panelBorder}`,
                      background: "#FFFFFF",
                      color: C.text,
                      fontSize: 15,
                      outline: "none",
                      boxShadow: "0 1px 3px rgba(23,18,51,0.05)",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ color: C.text, fontSize: 13.5, fontWeight: 600 }}>Celular</label>
                  <input
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="Digite seu celular..."
                    style={{
                      width: "100%",
                      padding: "16px 18px",
                      borderRadius: 14,
                      border: `1.5px solid ${C.panelBorder}`,
                      background: "#FFFFFF",
                      color: C.text,
                      fontSize: 15,
                      outline: "none",
                      boxShadow: "0 1px 3px rgba(23,18,51,0.05)",
                    }}
                  />
                </div>
                <PrimaryButton
                  onClick={handleSubmit}
                  disabled={!leadName.trim() || !leadCompany.trim() || !leadPhone.trim() || isSubmitting}
                  icon="💬"
                >
                  {isSubmitting ? "Enviando..." : "Falar com a Infinyt no WhatsApp!"}
                </PrimaryButton>
                {submitError && (
                  <p style={{ color: C.danger, fontSize: 12.5, textAlign: "center", margin: 0 }}>
                    Não foi possível salvar seus dados agora, mas o WhatsApp foi aberto normalmente.
                  </p>
                )}
              </div>

              <WhatsAppMock variant="demo" />
            </div>
          )}
        </Fade>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 460,
          textAlign: "center",
          color: C.mutedDark,
          fontSize: 12,
          padding: "20px 0 4px",
        }}
      >
        © 2026 Infinyt.IA
      </div>

      {showDisqualified && <DisqualifyModal onClose={() => setShowDisqualified(false)} />}
    </div>
  );
}
