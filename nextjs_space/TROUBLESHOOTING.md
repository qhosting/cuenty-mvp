# Guía de Resolución de Problemas - CUENTY MVP

## 🔧 Rutas API Funcionan en Desarrollo pero Fallan en Producción/Docker

### Problema
Los endpoints API (como `/api/site-config`, `/api/auth/session`, etc.) funcionan correctamente en desarrollo (`npm run dev`) pero retornan 404 en producción o cuando se despliegan en Docker/Easypanel.

### Causa Raíz
El problema estaba relacionado con la configuración de Next.js para producción. Cuando Next.js no está configurado en modo `standalone`, las rutas API pueden no incluirse correctamente en el build de producción, especialmente en entornos Docker.

### Solución Implementada (22 de Octubre, 2024)

Se implementó el **modo standalone de Next.js**, que es la configuración recomendada para despliegues en Docker. Los cambios incluyeron:

#### 1. Actualización de `next.config.js`
```javascript
const nextConfig = {
  // Modo standalone: optimizado para Docker y producción
  // Genera un servidor Node.js mínimo con todas las dependencias
  output: 'standalone',
  // ... resto de la configuración
};
```

**¿Qué hace el modo standalone?**
- Genera un servidor Node.js completo y autocontenido en `.next/standalone/`
- Incluye automáticamente todas las rutas API en el bundle
- Minimiza el tamaño de la imagen Docker copiando solo las dependencias necesarias
- Es más eficiente y confiable que `npm start` en producción

#### 2. Actualización del `Dockerfile`
El Dockerfile ahora copia correctamente la estructura standalone:

```dockerfile
# Copiar archivos construidos del frontend en modo standalone
COPY --from=frontend-builder /app/frontend/.next/standalone ./
COPY --from=frontend-builder /app/frontend/.next/static ./.next/static
COPY --from=frontend-builder /app/frontend/public ./public
```

**Estructura generada por standalone:**
```
.next/
├── standalone/
│   ├── server.js          # Servidor Node.js optimizado
│   ├── package.json
│   └── node_modules/      # Solo dependencias necesarias
├── static/                # Assets estáticos
└── ...
```

#### 3. Actualización de `start-docker.sh`
El script de inicio ahora usa el servidor standalone:

```bash
# Antes: npm start (más lento, más dependencias)
# Después: node server.js (más rápido, optimizado)
PORT=$FRONTEND_PORT \
NODE_ENV=production \
node server.js > "$FRONTEND_LOG" 2>&1 &
```

### Ventajas del Modo Standalone

1. **Rutas API Garantizadas**: Todas las rutas en `app/api/*` se incluyen automáticamente
2. **Imagen Docker Más Pequeña**: Solo se copian las dependencias realmente necesarias
3. **Inicio Más Rápido**: El servidor standalone es más eficiente que `npm start`
4. **Mejor Rastreo de Archivos**: Next.js analiza qué archivos son necesarios y solo incluye esos
5. **Recomendado Oficialmente**: Es la configuración oficial de Vercel para Docker

### Verificación Post-Despliegue

Después de redesplegar con estos cambios, verifica que las rutas API funcionen:

```bash
# En tu servidor/contenedor
curl http://localhost:3001/api/site-config
curl http://localhost:3001/api/auth/session
curl http://localhost:3001/api/auth/providers
```

### Proceso de Despliegue Actualizado

1. **Hacer commit y push de los cambios**:
```bash
git add .
git commit -m "fix: configurar Next.js en modo standalone para Docker"
git push origin main
```

2. **Redesplegar en Easypanel**:
   - Los cambios se detectarán automáticamente
   - El build tomará en cuenta el nuevo modo standalone
   - Las rutas API estarán disponibles en producción

3. **Verificar en producción**:
   - Abre la aplicación en el navegador
   - Abre DevTools (F12) → Network
   - Verifica que los endpoints `/api/*` retornen 200 en lugar de 404

### Troubleshooting del Modo Standalone

#### Error: "server.js no encontrado"
```bash
# Verificar que el build se completó correctamente
ls -la /app/nextjs_space/server.js
ls -la /app/nextjs_space/.next/static/

# Si faltan archivos, el build no generó el standalone correctamente
# Verifica que next.config.js tenga output: 'standalone'
```

#### Error: Rutas API aún retornan 404
```bash
# 1. Verificar que las rutas existen en el código
ls -la app/api/

# 2. Limpiar y reconstruir
rm -rf .next
npm run build

# 3. Verificar que el standalone se generó
ls -la .next/standalone/

# 4. Probar localmente antes de desplegar
NODE_ENV=production PORT=3001 node .next/standalone/server.js
```

#### Build de Docker Falla
```bash
# Verificar logs de build de Docker
docker build -t cuenty-test .

# Si falla en la etapa de build del frontend, revisar:
# 1. Que todas las dependencias estén en package.json
# 2. Que no haya errores de TypeScript
# 3. Que las variables de entorno de build estén correctas
```

### Referencias

- [Next.js Output File Tracing](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Modo Standalone](https://nextjs.org/docs/advanced-features/output-file-tracing#automatically-copying-traced-files)

---

## Errores 404 en Endpoints API (Desarrollo Local)

### Problema
Los endpoints API como `/api/site-config`, `/api/auth/session`, o `/api/auth/_log` están retornando 404 en la consola del navegador.

### Causas Comunes

1. **Caché de Next.js desactualizado**
   - Next.js cachea las rutas durante el desarrollo
   - Los cambios en archivos de la carpeta `app/api/` pueden no reflejarse inmediatamente

2. **Servidor no reiniciado después de cambios**
   - Los cambios en configuración de NextAuth o middleware requieren reinicio
   - El servidor en modo desarrollo no siempre detecta todos los cambios

3. **Build corrupto**
   - El caché en `.next` puede estar corrupto
   - Archivos compilados desactualizados

### Soluciones

#### Solución Rápida
```bash
# Limpiar caché y reiniciar
npm run clean:rebuild
```

#### Solución Manual

1. **Limpiar caché de Next.js:**
```bash
rm -rf .next
```

2. **Reiniciar el servidor:**
```bash
npm run dev
```

3. **Verificar endpoints:**
```bash
npm run verify:api
```

#### Solución Completa (Rebuild)

```bash
# 1. Detener el servidor (Ctrl+C)

# 2. Limpiar todo
rm -rf .next
rm -rf node_modules/.cache

# 3. Reinstalar dependencias (solo si es necesario)
npm install

# 4. Reconstruir
npm run build

# 5. Iniciar en modo producción
npm start
```

### Verificación de Endpoints

#### Verificar manualmente con curl:

```bash
# Site Config
curl http://localhost:3001/api/site-config

# Auth Session
curl http://localhost:3001/api/auth/session

# Auth Providers
curl http://localhost:3001/api/auth/providers
```

#### Usar script de verificación:
```bash
npm run verify:api
```

### Endpoints Importantes

| Endpoint | Método | Descripción | Respuesta Esperada |
|----------|---------|-------------|-------------------|
| `/api/site-config` | GET | Configuración del sitio | JSON con config |
| `/api/auth/session` | GET | Sesión actual | `{}` o sesión |
| `/api/auth/providers` | GET | Proveedores de auth | JSON con providers |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler | Depende de la acción |

### NextAuth Específico

#### Error: `/api/auth/session` retorna 404

**Diagnóstico:**
```bash
# Verificar que el archivo existe
ls -la app/api/auth/[...nextauth]/route.ts

# Verificar que NextAuth está instalado
npm list next-auth
```

**Solución:**
- Asegúrate de que `NEXTAUTH_URL` esté configurado en `.env`
- Verifica que `NEXTAUTH_SECRET` esté presente
- Reinicia el servidor después de cambios en `.env`

#### Error: `/api/auth/_log` retorna 404 o 400

**Nota:** Este endpoint es interno de NextAuth y puede retornar 400 en algunas situaciones normales. Un 400 no es necesariamente un error.

### Variables de Entorno Requeridas

Verifica que estas variables estén en tu `.env`:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=tu_secreto_aqui

# Database
DATABASE_URL=tu_url_de_database

# AWS (para uploads)
AWS_REGION=us-west-2
AWS_BUCKET_NAME=tu_bucket
AWS_FOLDER_PREFIX=tu_folder/
```

### Errores Comunes

#### 1. `Module not found: Can't resolve '@/lib/auth'`

**Solución:**
```bash
# Verificar que el archivo existe
ls -la lib/auth.ts

# Si no existe, crearlo desde el backup
git checkout lib/auth.ts
```

#### 2. `PrismaClient is not configured`

**Solución:**
```bash
# Generar el cliente de Prisma
npx prisma generate
```

#### 3. `EADDRINUSE: address already in use`

**Solución:**
```bash
# Encontrar el proceso usando el puerto 3001
lsof -i :3001

# Matarlo
kill -9 <PID>

# O usar el script
npm run kill:port
```

### Scripts Útiles

```json
{
  "verify:api": "node scripts/verify-api.js",
  "clean:rebuild": "rm -rf .next && npm run dev",
  "kill:port": "lsof -ti:3001 | xargs kill -9"
}
```

### Debugging Avanzado

#### Ver logs del servidor:
```bash
# Iniciar con logs detallados
DEBUG=next:* npm run dev
```

#### Verificar rutas compiladas:
```bash
# Después del build, verificar rutas
npm run build
grep -r "api/site-config" .next/
```

#### Inspeccionar en el navegador:
1. Abrir DevTools (F12)
2. Ir a la pestaña Network
3. Filtrar por "XHR" o "Fetch"
4. Verificar qué URLs se están llamando exactamente
5. Ver el código de respuesta y los headers

### Contacto para Soporte

Si ninguna de estas soluciones funciona:
1. Revisa los logs del servidor
2. Revisa los logs del navegador (console)
3. Verifica que todas las dependencias estén instaladas
4. Considera hacer un pull del repositorio y reinstalar

### Prevención

Para evitar estos problemas en el futuro:

1. **Siempre reinicia el servidor después de:**
   - Cambios en archivos de configuración (`.env`, `next.config.js`)
   - Cambios en `middleware.ts`
   - Cambios en `lib/auth.ts`
   - Instalación de nuevas dependencias

2. **Limpia el caché periódicamente:**
   ```bash
   npm run clean:rebuild
   ```

3. **Verifica los endpoints después de cambios importantes:**
   ```bash
   npm run verify:api
   ```

4. **Usa Git para rastrear cambios:**
   ```bash
   git status
   git diff
   ```
