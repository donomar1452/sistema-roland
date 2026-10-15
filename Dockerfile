# Multi-stage Dockerfile para Sistema Roland / Alonso

# Etapa 1: Compilación de Frontend y dependencias
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Instalar herramientas para módulos nativos (better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Entorno de Producción
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN apt-get update && apt-get install -y python3 make g++ --no-install-recommends && rm -rf /var/lib/apt/lists/*
RUN npm install --omit=dev

# Copiar archivos compilados y servidor
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public

# Directorios para base de datos SQLite y copias de respaldo persistentes
RUN mkdir -p /app/data /app/backups

VOLUME ["/app/data", "/app/backups"]

EXPOSE 3001

CMD ["node", "server/index.js"]
