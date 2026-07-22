import { useState, useEffect } from "react";
import {
  C,
  STEPS,
  WHATSAPP_NUMBER,
  REVENUE_RANGES,
  COST_PER_CONTACT_INFINYT,
  COST_PER_CONTACT_OTHERS,
  REACTIVATION_CONVERSION_RATE,
} from "./constants.js";
import { saveLead } from "./lib/supabase.js";
import { initPixel, trackStep, trackLead } from "./lib/fbPixel.js";
import { trackPageView, trackStepView } from "./lib/analytics.js";
import {
  ProgressBar,
  Logo,
  PrimaryButton,
  OptionCard,
  Fade,
  WhatsAppMock,
  FeatureCard,
} from "./components/UI.jsx";

const parseNumber = (str) => parseInt(String(str).replace(/\D/g, ""), 10) || 0;
const formatBRL = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function InfinytFunnel() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({
    contacts: "",
    whoAnswers: "",
    lostClient: "",
    afterHours: "",
    wouldHelp: "",
    revenue: "",
    ticketMedio: "",
  });
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");

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

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));
  const setAnswer = (key, val) => setAnswers((a) => ({ ...a, [key]: val }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(false);

    const { ok } = await saveLead({
      name: leadName.trim(),
      phone: leadPhone.trim(),
      contacts: answers.contacts,
      who_answers: answers.whoAnswers,
      lost_client: answers.lostClient,
      after_hours: answers.afterHours,
      would_help: answers.wouldHelp,
      revenue_range: answers.revenue,
      ticket_medio: answers.ticketMedio,
    });

    if (!ok) setSubmitError(true);
    trackLead({ revenue_range: answers.revenue });

    const msg = "Olá quero agendar uma demonstração";
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");

    setIsSubmitting(false);
  };

  const canContinue = () => {
    if (step === "contacts") return answers.contacts.trim().length > 0;
    if (step === "who-answers") return !!answers.whoAnswers;
    if (step === "calculator") return parseNumber(answers.ticketMedio) > 0;
    if (step === "lost-client") return !!answers.lostClient;
    if (step === "after-hours") return !!answers.afterHours;
    if (step === "would-help") return !!answers.wouldHelp;
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
        padding: "28px 16px 80px",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: ${C.mutedDark}; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 22 }}>
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
                Descubra como clínicas e consultórios estão{" "}
                <span style={{ color: C.primaryLight }}>triplicando o faturamento</span>{" "}
                com a IA que atende, convence e agenda pacientes no WhatsApp — 24 horas por dia
              </h1>

              <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.5, margin: 0 }}>
                Responde em segundos, convence com técnica e agenda automaticamente — mesmo fora do horário comercial.
              </p>

              <div style={{ width: "100%" }}>
                <PrimaryButton onClick={next} icon="🔓">
                  Desbloquear a Infinyt
                </PrimaryButton>
              </div>
            </div>
          )}

          {step === "contacts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <WhatsAppMock variant="normal" />
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 21, color: C.text, textAlign: "center", margin: 0 }}>
                Quantos <span style={{ color: C.primaryLight }}>contatos</span> você recebe por mês no WhatsApp da sua clínica?
              </h2>
              <input
                value={answers.contacts}
                onChange={(e) => setAnswer("contacts", e.target.value)}
                placeholder="digite quantos contatos você recebe..."
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
              <PrimaryButton onClick={next} disabled={!canContinue()}>
                Continuar
              </PrimaryButton>
            </div>
          )}

          {step === "who-answers" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 21, color: C.text, textAlign: "center", margin: 0 }}>
                Quem costuma atender seus pacientes no WhatsApp hoje? 📱
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Eu mesmo(a)", "Minha secretária", "Uma equipe de atendimento", "Ninguém responde de forma consistente"].map((opt) => (
                  <OptionCard key={opt} label={opt} selected={answers.whoAnswers === opt} onClick={() => setAnswer("whoAnswers", opt)} />
                ))}
              </div>
              <PrimaryButton onClick={next} disabled={!canContinue()}>
                Continuar
              </PrimaryButton>
            </div>
          )}

          {step === "calculator" && (() => {
            const contactsNum = parseNumber(answers.contacts);
            const costInfinyt = contactsNum * COST_PER_CONTACT_INFINYT;
            const costOthers = contactsNum * COST_PER_CONTACT_OTHERS;
            const economy = costOthers - costInfinyt;
            const ticketNum = parseNumber(answers.ticketMedio);
            const potentialClients = Math.round(contactsNum * REACTIVATION_CONVERSION_RATE);
            const potentialRevenue = potentialClients * ticketNum;

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 21, color: C.text, textAlign: "center", margin: 0 }}>
                  Vamos calcular o quanto você está{" "}
                  <span style={{ color: C.danger }}>deixando na mesa</span> com esses{" "}
                  <span style={{ color: C.primaryLight }}>{contactsNum || "0"} contatos</span>?
                </h2>

                <div
                  style={{
                    border: `1px solid ${C.panelBorder}`,
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr" }}>
                    <div style={{ padding: "12px 14px" }} />
                    <div
                      style={{
                        padding: "12px 8px",
                        textAlign: "center",
                        color: C.danger,
                        fontWeight: 700,
                        fontSize: 13,
                        background: "rgba(225,29,94,0.06)",
                      }}
                    >
                      ✕ Outras empresas
                    </div>
                    <div
                      style={{
                        padding: "12px 8px",
                        textAlign: "center",
                        color: C.success,
                        fontWeight: 700,
                        fontSize: 13,
                        background: "rgba(22,163,74,0.08)",
                      }}
                    >
                      ✓ Com a Infinyt
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", borderTop: `1px solid ${C.panelBorder}` }}>
                    <div style={{ padding: "14px", color: C.muted, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center" }}>
                      Custo por contato
                    </div>
                    <div style={{ padding: "14px 8px", textAlign: "center", color: C.text, fontSize: 15 }}>R$ 0,35</div>
                    <div style={{ padding: "14px 8px", textAlign: "center", color: C.text, fontSize: 15, fontWeight: 700, background: "rgba(22,163,74,0.04)" }}>
                      R$ 0,04
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", borderTop: `1px solid ${C.panelBorder}` }}>
                    <div style={{ padding: "14px", color: C.muted, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center" }}>
                      Custo total p/ falar com {contactsNum || 0} pessoas
                    </div>
                    <div style={{ padding: "14px 8px", textAlign: "center", color: C.text, fontSize: 15 }}>{formatBRL(costOthers)}</div>
                    <div style={{ padding: "14px 8px", textAlign: "center", color: C.text, fontSize: 15, fontWeight: 700, background: "rgba(22,163,74,0.04)" }}>
                      {formatBRL(costInfinyt)}
                    </div>
                  </div>
                </div>

                <p style={{ color: C.text, fontSize: 15, lineHeight: 1.5, textAlign: "center", margin: 0 }}>
                  Com a Infinyt você economiza{" "}
                  <b style={{ color: C.success }}>{formatBRL(economy)}</b> só para reativar essa base
                  que já te procurou.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ color: C.text, fontSize: 13.5, fontWeight: 600 }}>
                    Qual o ticket médio dos seus procedimentos?
                  </label>
                  <input
                    value={answers.ticketMedio}
                    onChange={(e) => setAnswer("ticketMedio", e.target.value)}
                    placeholder="Ex: 350"
                    inputMode="numeric"
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

                {ticketNum > 0 && (
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                      borderRadius: 16,
                      padding: 18,
                      color: "#FFFFFF",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      boxShadow: `0 8px 24px ${C.primary}45`,
                    }}
                  >
                    <span style={{ fontSize: 13, opacity: 0.85 }}>
                      Se apenas 1% desses contatos vira paciente ({potentialClients}{" "}
                      {potentialClients === 1 ? "pessoa" : "pessoas"})
                    </span>
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 26 }}>
                      +{formatBRL(potentialRevenue)}
                    </span>
                    <span style={{ fontSize: 13, opacity: 0.85 }}>
                      de faturamento extra por mês só reativando quem já falou com você
                    </span>

                    <div style={{ height: 1, background: "rgba(255,255,255,0.25)", margin: "6px 0" }} />

                    <span style={{ fontSize: 14 }}>
                      Pagando somente{" "}
                      <b style={{ fontSize: 17 }}>{formatBRL(costInfinyt)}</b> com a Infinyt
                      para falar com esses {contactsNum || 0} contatos
                    </span>
                  </div>
                )}

                <PrimaryButton onClick={next} disabled={!canContinue()}>
                  Continuar
                </PrimaryButton>
              </div>
            );
          })()}

          {step === "lost-client" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <WhatsAppMock variant="lost" />
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 21, color: C.text, textAlign: "center", margin: 0 }}>
                Já aconteceu de perder uma cliente por causa da demora na resposta?
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <OptionCard
                  label="Sim! Recebo mensagens, mas não consigo responder rapidamente."
                  selected={answers.lostClient === "sim"}
                  onClick={() => setAnswer("lostClient", "sim")}
                />
                <OptionCard
                  label="Não! Consigo atender rapidamente e com qualidade."
                  selected={answers.lostClient === "nao"}
                  onClick={() => setAnswer("lostClient", "nao")}
                />
              </div>
              <PrimaryButton onClick={next} disabled={!canContinue()}>
                Continuar
              </PrimaryButton>
            </div>
          )}

          {step === "after-hours" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 21, color: C.text, textAlign: "center", margin: 0 }}>
                Sua clínica responde mensagens fora do horário comercial e/ou feriados?
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <OptionCard
                  label="Sim! Tenho uma secretária ativa sempre."
                  selected={answers.afterHours === "sim"}
                  onClick={() => setAnswer("afterHours", "sim")}
                  tone="success"
                />
                <OptionCard
                  label="Não, acaba ficando para o próximo dia útil."
                  selected={answers.afterHours === "nao"}
                  onClick={() => setAnswer("afterHours", "nao")}
                  tone="danger"
                />
              </div>
              <PrimaryButton onClick={next} disabled={!canContinue()}>
                Continuar
              </PrimaryButton>
            </div>
          )}

          {step === "stat" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, textAlign: "center" }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 23, color: C.text, margin: 0 }}>
                Você sabia disso? 🚨
              </h2>
              <p style={{ color: C.muted, fontSize: 15.5, lineHeight: 1.5, margin: 0 }}>
                67% dos leads que entram em contato com uma estética desistem se ninguém responde em 2 minutos.
              </p>
              <div
                style={{
                  background: C.panel,
                  border: `1px solid ${C.panelBorder}`,
                  borderRadius: 16,
                  padding: 18,
                  color: C.text,
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: "0 1px 4px rgba(23,18,51,0.05)",
                }}
              >
                Pesquisas do setor mostram que 2 em cada 3 clientes interessados em procedimentos estéticos mudam de clínica quando não recebem resposta rápida.
              </div>
              <p style={{ color: C.text, fontSize: 15.5, lineHeight: 1.6, margin: 0 }}>
                Isso significa que a cada <b style={{ color: C.primaryLight }}>10 pessoas</b> que te mandam mensagem,{" "}
                <b style={{ color: C.primaryLight }}>6 podem estar fechando com a concorrência</b> antes de você sequer ver o WhatsApp.
              </p>
              <PrimaryButton onClick={next}>Continuar</PrimaryButton>
            </div>
          )}

          {step === "would-help" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 21, color: C.text, textAlign: "center", margin: 0 }}>
                Se você tivesse uma secretária 24h, treinada com técnicas de vendas, agendando e vendendo novos procedimentos todos os dias, te ajudaria?
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Claro! Quem não ia querer?", "Seria o meu sonho!", "Não me ajudaria."].map((opt) => (
                  <OptionCard key={opt} label={opt} selected={answers.wouldHelp === opt} onClick={() => setAnswer("wouldHelp", opt)} />
                ))}
              </div>
              <PrimaryButton onClick={next} disabled={!canContinue()}>
                Continuar
              </PrimaryButton>
            </div>
          )}

          {step === "social-proof" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18, textAlign: "center" }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 20, color: C.text, margin: 0 }}>
                Enquanto você respondia este quiz, <span style={{ color: C.primaryLight }}>7 procedimentos</span> foram agendados automaticamente por quem já usa a Infinyt!
              </h2>
              <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.5, margin: 0 }}>
                Enquanto você avalia seus próximos passos, outras clínicas de estética já garantiram novos agendamentos sem depender da equipe, sem deixar pacientes no vácuo e sem perder oportunidades.
              </p>
              <PrimaryButton onClick={next} icon="🤩">
                Sim, quero ver
              </PrimaryButton>
            </div>
          )}

          {step === "features" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 20, color: C.text, textAlign: "center", margin: 0 }}>
                A <span style={{ color: C.primaryLight }}>Infinyt</span> é sua nova secretária: treinada em vendas, especialista em estética e disponível 24 horas por dia!
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <FeatureCard>Responde todos os seus leads no WhatsApp em segundos</FeatureCard>
                <FeatureCard>Encanta cada paciente com mensagens humanizadas</FeatureCard>
                <FeatureCard>Apresenta os procedimentos da sua clínica com técnica de venda validada</FeatureCard>
                <FeatureCard>Faz agendamentos automaticamente direto na sua agenda</FeatureCard>
                <FeatureCard>Trabalha 24h todos os dias, inclusive fora do horário comercial e feriados</FeatureCard>
                <FeatureCard>Faz follow-up automático com quem parou de responder</FeatureCard>
              </div>
              <p style={{ color: C.text, fontSize: 14.5, lineHeight: 1.5, textAlign: "center", margin: 0 }}>
                💡 Ela não "dispara" mensagens. Ela <b style={{ color: C.primaryLight }}>ENCANTA</b> com intencionalidade.
              </p>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.5, textAlign: "center", margin: 0 }}>
                É como ter a melhor secretária do mundo atendendo 24/7 e transformando contatos em procedimentos!
              </p>
              <PrimaryButton onClick={next}>Gostei, é isso que preciso!</PrimaryButton>
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

              <WhatsAppMock variant="demo" />

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
                  disabled={!leadName.trim() || !leadPhone.trim() || isSubmitting}
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
            </div>
          )}
        </Fade>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          textAlign: "center",
          color: C.mutedDark,
          fontSize: 12,
          padding: "12px 0",
          background: C.bg,
        }}
      >
        © 2026 Infinyt.IA
      </div>
    </div>
  );
}
