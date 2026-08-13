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
  "who-answers",
  "calculator",
  "lost-client",
  "after-hours",
  "stat",
  "would-help",
  "revenue",
  "final",
];

// Custo por contato para calcular a calculadora de reativação de base
export const COST_PER_CONTACT_INFINYT = 0.04;
export const COST_PER_CONTACT_OTHERS = 0.35;
export const REACTIVATION_CONVERSION_RATE = 0.01;

// Faixas de contatos/mês (etapa "contacts"). "value" é um número
// representativo de cada faixa, usado só pela calculadora da etapa
// seguinte (não é o valor exato que o lead recebe/mês).
export const CONTACTS_RANGES = [
  { label: "Menos de 50 contatos", value: 35 },
  { label: "50 a 100 contatos", value: 75 },
  { label: "100 a 200 contatos", value: 150 },
  { label: "Mais de 200 contatos", value: 250 },
];

export const REVENUE_RANGES = [
  "R$ 5.000 - R$ 10.000",
  "R$ 10.000 - R$ 20.000",
  "R$ 20.000 - R$ 30.000",
  "R$ 30.000 - R$ 50.000",
  "R$ 50.000 - R$ 100.000",
  "R$ 100.000 - R$ 200.000",
  "Acima de R$ 200.000",
];

// Faixa de faturamento que desqualifica o lead: some o funil aqui, sem
// avançar para o final e sem disparar Lead no Meta Pixel.
export const DISQUALIFYING_REVENUE = REVENUE_RANGES[0];

export const WHATSAPP_NUMBER = "557996051013"; // +55 79 9605-1013

export const INSTAGRAM_URL = "https://www.instagram.com/infinyt.ia";
export const INSTAGRAM_HANDLE = "@infinyt.ia";
