# --- Etapa 1: build ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Essas variáveis precisam existir NO MOMENTO DO BUILD (Vite as "grava" no JS gerado).
# No Easypanel, defina as mesmas chaves na aba "Environment" do serviço.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_FB_PIXEL_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_FB_PIXEL_ID=$VITE_FB_PIXEL_ID

RUN npm run build

# --- Etapa 2: servidor estático ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
