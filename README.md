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
