# --- Etapa 1: build ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Essas variáveis precisam existir NO MOMENTO DO BUILD (Vite as "grava" no JS gerado).
# No Easypanel, defina as mesmas chaves na aba "Environment" do serviço.
# Sempre que só o valor de uma env var mudar (sem novo commit), force um novo push
# para evitar que o Easypanel reaproveite a imagem já construída para esse commit.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_FB_PIXEL_ID
ARG VITE_DASHBOARD_PASSWORD
ARG CACHE_BUST=3
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_FB_PIXEL_ID=$VITE_FB_PIXEL_ID
ENV VITE_DASHBOARD_PASSWORD=$VITE_DASHBOARD_PASSWORD

RUN npm run build

# --- Etapa 2: servidor estático ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
