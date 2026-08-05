# Infinyt Funnel

Funil de quiz/captura de leads da Infinyt.IA, feito em React + Vite, com
gravação dos leads no Supabase.

## Estrutura do projeto

```
infinyt-funnel/
├── index.html              # ponto de entrada HTML
├── package.json
├── vite.config.js
├── .env.example             # copie para .env e preencha
├── src/
│   ├── main.jsx              # bootstrap do React
│   ├── App.jsx                # lógica do funil (passos, estado, formulário)
│   ├── constants.js           # cores da marca, lista de passos, número do WhatsApp
│   ├── lib/
│   │   └── supabase.js        # função saveLead() que grava no Supabase via REST API
│   ├── components/
│   │   └── UI.jsx             # componentes reutilizáveis (Logo, botões, cards, mock do WhatsApp...)
│   └── assets/
│       └── logo.png           # logo da Infinyt (arquivo de imagem real)
```

## Como rodar localmente

```bash
npm install
cp .env.example .env
# edite o .env com sua URL e chave do Supabase
npm run dev
```

## Configurar o Supabase

1. Crie a tabela `leads` (SQL Editor do Supabase):

```sql
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  contacts text,
  who_answers text,
  lost_client text,
  after_hours text,
  would_help text,
  created_at timestamptz default now()
);

alter table leads enable row level security;

create policy "Allow anon insert"
  on leads for insert
  to anon
  with check (true);
```

2. Em **Project Settings → API**, copie a "Project URL" e a chave "anon public"
   e cole no arquivo `.env`:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
```

Nunca coloque a chave `service_role` no front-end — apenas a `anon public`,
que só tem permissão de inserir (graças à policy de RLS acima).

## Conversions API (CAPI) do Meta

Além do Pixel client-side (`src/lib/fbPixel.js`), o evento `Lead` também é
enviado direto pelo servidor via uma Supabase Edge Function chamada
**`super-function`** (código em `supabase/functions/super-function`), usando
o mesmo `event_id` para o Meta deduplicar os dois envios. O access token do
Meta fica só como secret da function — nunca em uma variável `VITE_*` (essas
são embutidas no JS público no build).

Deploy da function (uma vez, e sempre que `index.ts` mudar). Pode ser feito
pelo painel do Supabase (Edge Functions → editar `super-function` → colar o
código atualizado → Deploy), ou via CLI:

```bash
# instalar o CLI (uma vez)
brew install supabase/tap/supabase   # ou: npx supabase <comando>

supabase login

# configurar os secrets (uma vez, ou sempre que o token for rotacionado)
supabase secrets set META_PIXEL_ID=1050569714171585 --project-ref ezczzgbbfrlrzqsctapc
supabase secrets set META_ACCESS_TOKEN=SEU_TOKEN_AQUI --project-ref ezczzgbbfrlrzqsctapc

# deploy
supabase functions deploy super-function --project-ref ezczzgbbfrlrzqsctapc
```

## Build de produção

```bash
npm run build
```

Gera a pasta `dist/`, pronta para publicar em qualquer host estático
(Vercel, Netlify, Cloudflare Pages etc). Nesses serviços, configure as
mesmas variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel
de "Environment Variables" do projeto.

## Editar o funil

- Textos e novas perguntas: `src/App.jsx`
- Cores e paleta da marca: `src/constants.js` (objeto `C`)
- Número do WhatsApp de contato: `src/constants.js` (`WHATSAPP_NUMBER`)
- Componentes visuais (botões, cards, mockup do chat): `src/components/UI.jsx`
