// ---- Infinyt.IA brand tokens ----
export const C = {
  bg: "#FFFFFF",
  panel: "#F6F4FC",
  panelBorder: "#E4DFF5",
  primary: "#4B3FE0",
  primaryLight: "#7C6CFF",
  primaryDark: "#2A2290",
  text: "#171233",
  muted: "#5C5578",
  mutedDark: "#9A94B8",
  success: "#16A34A",
  danger: "#E11D5E",
};

export const STEPS = [
  "welcome",
  "contacts",
  "lost-client",
  "revenue",
  "final",
];

// Faixas de contatos/mês (etapa "contacts").
export const CONTACTS_RANGES = [
  "Menos de 50 contatos",
  "50 a 100 contatos",
  "100 a 200 contatos",
  "Mais de 200 contatos",
];

// Faixa de "já perdeu cliente por demora" (etapa "lost-client") — escala de
// frequência, do pior sinal de dor (mais qualificado) ao melhor.
export const LOST_CLIENT_OPTIONS = [
  "Sim, com frequência",
  "Às vezes",
  "Raramente",
  "Nunca",
];

export const REVENUE_RANGES = [
  "Até R$ 20.000",
  "R$ 20.000 - R$ 50.000",
  "R$ 50.000 - R$ 100.000",
  "Acima de R$ 100.000",
];

// Faixa de faturamento que desqualifica o lead: some o funil aqui, sem
// avançar para o final e sem disparar Lead no Meta Pixel.
export const DISQUALIFYING_REVENUE = REVENUE_RANGES[0];

export const WHATSAPP_NUMBER = "557996051013"; // +55 79 9605-1013

export const INSTAGRAM_URL = "https://www.instagram.com/infinyt.ia";
export const INSTAGRAM_HANDLE = "@infinyt.ia";
