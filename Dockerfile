Here's the result of running `cat -n` on /home/ubuntu/cuenty_mvp/Dockerfile:
     1	# ============================================================================
     2	# Dockerfile para CUENTY - Sistema unificado Backend + Frontend
     3	# Build secuencial robusto: Backend → Frontend → Imagen Final
     4	# ============================================================================
     5	
     6	# ============================================================================
     7	# ETAPA 1: Construcción del Backend
     8	# ============================================================================
     9	FROM node:18-alpine AS backend-builder
    10	
    11	WORKDIR /app/backend
    12	
    13	# Copiar archivos de dependencias primero (mejor uso de cache de Docker)
    14	COPY backend/package.json backend/package-lock.json ./
    15	
    16	# Instalar TODAS las dependencias (incluyendo dev para posibles builds)
    17	RUN npm ci
    18	
    19	# Copiar código del backend
    20	COPY backend/ ./
    21	
    22	# Verificar que la instalación fue exitosa
    23	RUN echo "✓ Backend dependencies installed successfully" && \
    24	    node --version && \
    25	    npm --version
    26	
    27	# ============================================================================
    28	# ETAPA 2: Construcción del Frontend Next.js
    29	# ============================================================================
    30	FROM node:18-alpine AS frontend-builder
    31	
    32	WORKDIR /app/frontend
    33	
    34	# Copiar archivos de dependencias primero (mejor uso de cache)
    35	COPY nextjs_space/package.json nextjs_space/package-lock.json ./
    36	
    37	# Instalar TODAS las dependencias (necesarias para el build)
    38	RUN npm ci
    39	
    40	# Copiar código del frontend
    41	COPY nextjs_space/ ./
    42	
    43	# Variables de entorno necesarias para el build
    44	ENV NEXT_TELEMETRY_DISABLED=1
    45	ENV NODE_ENV=production
    46	# Variables para NextAuth durante el build (no se usan en runtime)
    47	ENV BUILDING=true
    48	ENV NEXTAUTH_URL=http://localhost:3000
    49	ENV NEXTAUTH_SECRET=build-time-secret-not-used-in-production
    50	ENV DATABASE_URL=file:./build-dummy.db
    51	
    52	# Generar Prisma Client ANTES del build de Next.js
    53	RUN npx prisma generate && \
    54	    echo "✓ Prisma Client generated successfully"
    55	
    56	# Build del frontend Next.js
    57	RUN npm run build
    58	
    59	# Verificar que el build fue exitoso
    60	RUN echo "✓ Frontend build completed successfully" && \
    61	    ls -la .next/ && \
    62	    echo "Build output size:" && \
    63	    du -sh .next/
    64	
    65	# ============================================================================
    66	# ETAPA 3: Imagen Final - Backend + Frontend combinados
    67	# ============================================================================
    68	FROM node:18-alpine
    69	
    70	# Instalar dependencias del sistema necesarias
    71	RUN apk add --no-cache \
    72	    bash \
    73	    curl \
    74	    lsof \
    75	    tini
    76	
    77	# Crear usuario no-root para seguridad
    78	RUN addgroup -g 1001 -S nodejs && \
    79	    adduser -S nodejs -u 1001
    80	
    81	# Establecer directorio de trabajo
    82	WORKDIR /app
    83	
    84	# ============================================================================
    85	# Copiar Backend construido (solo producción)
    86	# ============================================================================
    87	WORKDIR /app/backend
    88	
    89	# Copiar package.json primero
    90	COPY backend/package.json backend/package-lock.json ./
    91	
    92	# Instalar SOLO dependencias de producción
    93	RUN npm ci --only=production && \
    94	    echo "✓ Backend production dependencies installed"
    95	
    96	# Copiar código del backend desde la etapa builder
    97	COPY --from=backend-builder /app/backend/ ./
    98	
    99	# ============================================================================
   100	# Copiar Frontend construido
   101	# ============================================================================
   102	WORKDIR /app/nextjs_space
   103	
   104	# Copiar package.json y package-lock.json
   105	COPY --from=frontend-builder /app/frontend/package.json \
   106	                             /app/frontend/package-lock.json \
   107	                             ./
   108	
   109	# Instalar SOLO dependencias de producción para Next.js
   110	RUN npm ci --only=production && \
   111	    echo "✓ Frontend production dependencies installed"
   112	
   113	# Copiar el directorio prisma (necesario para el Cliente de Prisma)
   114	COPY --from=frontend-builder /app/frontend/prisma ./prisma
   115	
   116	# Generar Prisma Client en la imagen final (con binarios correctos para Alpine)
   117	RUN npx prisma generate && \
   118	    echo "✓ Prisma Client generated for production"
   119	
   120	# Copiar archivos construidos y necesarios del frontend
   121	COPY --from=frontend-builder /app/frontend/.next ./.next
   122	COPY --from=frontend-builder /app/frontend/public ./public
   123	COPY --from=frontend-builder /app/frontend/next.config.js ./
   124	COPY --from=frontend-builder /app/frontend/middleware.ts ./
   125	COPY --from=frontend-builder /app/frontend/app ./app
   126	COPY --from=frontend-builder /app/frontend/components ./components
   127	COPY --from=frontend-builder /app/frontend/lib ./lib
   130	
   131	# ============================================================================
   132	# Configuración final
   133	# ============================================================================
   134	WORKDIR /app
   135	
   136	# Copiar scripts de inicio y healthcheck
   137	COPY start-docker.sh ./
   138	COPY scripts/ ./scripts/
   139	RUN chmod +x start-docker.sh ./scripts/*.sh
   140	
   141	# Crear directorios necesarios
   142	RUN mkdir -p /app/logs /app/database && \
   143	    chown -R nodejs:nodejs /app
   144	
   145	# Cambiar al usuario no-root
   146	USER nodejs
   147	
   148	# Exponer puertos
   149	# 3000: Backend API (con proxy al frontend)
   150	# 3001: Frontend Next.js (interno)
   151	EXPOSE 3000 3001
   152	
   153	# Variables de entorno
   154	ENV NODE_ENV=production \
   155	    PORT=3000 \
   156	    NEXTJS_PORT=3001 \
   157	    NEXT_TELEMETRY_DISABLED=1
   158	
   159	# Healthcheck mejorado con más tiempo de inicio
   160	HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
   161	  CMD ./scripts/healthcheck.sh || exit 1
   162	
   163	# Usar tini como init system para mejor manejo de señales
   164	ENTRYPOINT ["/sbin/tini", "--"]
   165	
   166	# Comando de inicio
   167	CMD ["./start-docker.sh"]
   168	