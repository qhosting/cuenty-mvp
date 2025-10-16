
# Dockerfile para CUENTY MVP
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache bash

# Crear directorio de la aplicación
WORKDIR /app

# Copiar package.json
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar código de la aplicación
COPY backend/ .

# Copiar frontend estático al public del backend
COPY frontend/ ./public/

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
