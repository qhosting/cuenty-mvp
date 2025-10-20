# Sistema de Control de Versión - CUENTY MVP

## Descripción General

CUENTY MVP implementa un sistema de versionado simple y efectivo que permite verificar fácilmente qué versión del sistema está instalada en producción. El sistema utiliza Semantic Versioning (SemVer) y expone la versión a través de endpoints API y componentes visuales en el frontend.

## Estructura de Versiones

El proyecto sigue la convención **Semantic Versioning 2.0.0** (https://semver.org/):

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Cambios incompatibles con versiones anteriores (breaking changes)
- **MINOR**: Nuevas funcionalidades compatibles con versiones anteriores
- **PATCH**: Correcciones de bugs y mejoras menores

### Ejemplos:
- `1.0.0` - Versión inicial de producción
- `1.1.0` - Nueva funcionalidad agregada
- `1.1.1` - Corrección de un bug
- `2.0.0` - Cambio significativo que rompe compatibilidad

## Ubicación de las Versiones

Las versiones están definidas en los archivos `package.json` tanto del frontend como del backend:

### Frontend (Next.js)
```
/nextjs_space/package.json
```

### Backend (Node.js/Express)
```
/backend/package.json
```

## Endpoints de Versión

### Backend API
**Endpoint:** `GET /api/version`

**Respuesta:**
```json
{
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2025-10-20T15:00:00.000Z",
  "name": "cuenty-backend",
  "description": "Backend API para CUENTY - Plataforma de gestión de cuentas de streaming"
}
```

### Frontend API
**Endpoint:** `GET /api/version` (dentro de Next.js)

**Respuesta:**
```json
{
  "version": "1.0.0",
  "name": "nextjs_space",
  "environment": "production",
  "timestamp": "2025-10-20T15:00:00.000Z"
}
```

## Visualización en el Frontend

El sistema muestra la versión en tres lugares principales:

### 1. Footer del Sitio Público
- Se muestra como un badge pequeño: `API v1.0.0`
- Ubicado en el footer inferior junto a los derechos de autor
- Componente: `/components/footer.tsx`

### 2. Panel de Administración
- Se muestra en el sidebar del admin en la parte inferior
- Formato: `API v1.0.0`
- Componente: `/components/admin/admin-layout.tsx`

### 3. Componente Reutilizable
- Componente genérico disponible para uso en cualquier página
- Ubicación: `/components/version-display.tsx`
- Tres variantes:
  - **badge**: Versión compacta con icono
  - **minimal**: Solo número de versión
  - **full**: Información detallada con entorno y timestamp

**Ejemplo de uso:**
```tsx
import { VersionDisplay } from '@/components/version-display'

// Badge simple
<VersionDisplay variant="badge" />

// Versión mínima
<VersionDisplay variant="minimal" />

// Información completa
<VersionDisplay variant="full" />
```

## Cómo Actualizar la Versión

### Paso 1: Actualizar package.json

#### Para Frontend:
```bash
cd nextjs_space
npm version patch   # Para corrección de bugs (1.0.0 -> 1.0.1)
npm version minor   # Para nuevas funcionalidades (1.0.0 -> 1.1.0)
npm version major   # Para cambios incompatibles (1.0.0 -> 2.0.0)
```

#### Para Backend:
```bash
cd backend
npm version patch   # Para corrección de bugs (1.0.0 -> 1.0.1)
npm version minor   # Para nuevas funcionalidades (1.0.0 -> 1.1.0)
npm version major   # Para cambios incompatibles (1.0.0 -> 2.0.0)
```

### Paso 2: Actualizar CHANGELOG.md

Documenta los cambios en el archivo `CHANGELOG.md` siguiendo el formato:

```markdown
## [1.1.0] - 2025-10-20

### Agregado
- Sistema de control de versión visible
- Componente VersionDisplay reutilizable
- Endpoint GET /api/version mejorado

### Modificado
- Mejorado el footer con visualización de versión

### Corregido
- Correcciones en la ruta /admin/login
```

### Paso 3: Commit y Deploy

```bash
git add .
git commit -m "chore: bump version to 1.1.0"
git push origin main
```

### Paso 4: Verificar en Producción

Después del deploy, verifica la versión accediendo a:
- Frontend: `https://tu-dominio.com/api/version`
- Backend: `https://api.tu-dominio.com/api/version`
- O simplemente revisando el footer del sitio web o el panel de admin

## Sincronización de Versiones

**Importante:** Aunque el frontend y backend tienen archivos `package.json` separados, se recomienda mantener las versiones sincronizadas para mayor claridad:

```bash
# Script para sincronizar versiones (crear este script si es necesario)
./scripts/sync-versions.sh 1.1.0
```

## Mejores Prácticas

1. **Actualiza la versión antes de cada deploy a producción**
2. **Documenta todos los cambios en CHANGELOG.md**
3. **Utiliza tags de git para marcar releases:**
   ```bash
   git tag -a v1.1.0 -m "Release version 1.1.0"
   git push origin v1.1.0
   ```
4. **En producción, siempre verifica la versión después del deploy**
5. **Mantén sincronizadas las versiones del frontend y backend cuando sea posible**

## Troubleshooting

### La versión no se actualiza en el sitio

1. Verifica que el archivo `package.json` tenga la versión correcta
2. Limpia el caché de Next.js: `rm -rf .next`
3. Reconstruye el proyecto: `npm run build`
4. Verifica las variables de entorno
5. Confirma que el endpoint `/api/version` esté respondiendo correctamente

### El componente VersionDisplay no muestra nada

1. Verifica que el endpoint `/api/version` esté funcionando
2. Revisa la consola del navegador para errores de red
3. Confirma que el componente esté importado correctamente

## Archivos Relacionados

```
/nextjs_space/
  ├── package.json                           # Versión del frontend
  ├── app/api/version/route.ts              # Endpoint de versión frontend
  ├── components/
  │   ├── footer.tsx                        # Footer con versión
  │   ├── version-display.tsx               # Componente de versión reutilizable
  │   └── admin/admin-layout.tsx            # Layout admin con versión

/backend/
  ├── package.json                          # Versión del backend
  └── routes/versionRoutes.js              # Endpoint de versión backend

/CHANGELOG.md                               # Historial de cambios
/VERSIONING.md                              # Este documento
```

## Referencias

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [npm version documentation](https://docs.npmjs.com/cli/v8/commands/npm-version)

---

**Última actualización:** Octubre 20, 2025
**Versión de este documento:** 1.0.0
