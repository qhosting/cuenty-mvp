# Documentación: Configuración de Chatwoot en la UI Admin

## 📋 Resumen de Cambios

Se han agregado campos de configuración de Chatwoot en la página de configuración del administrador (`/admin/config`), permitiendo al administrador configurar la integración con Chatwoot directamente desde la interfaz de usuario.

---

## 🎯 Objetivo

Facilitar la configuración de Chatwoot mediante una interfaz gráfica intuitiva, permitiendo al administrador:
- Ingresar la URL de su instancia de Chatwoot
- Proporcionar el Access Token de autenticación
- Especificar el Account ID correspondiente

---

## 🔧 Cambios Implementados

### 1. Frontend - Servicio de Autenticación (`nextjs_space/lib/admin-auth.ts`)

Se agregaron dos nuevos métodos al servicio `adminApiService`:

```typescript
// Obtener configuración de Chatwoot
getChatwootConfig: async () => {
  const response = await adminApi.get('/api/admin/config/chatwoot')
  return { success: true, data: response.data }
}

// Guardar configuración de Chatwoot
saveChatwootConfig: async (data: any) => {
  const response = await adminApi.post('/api/admin/config/chatwoot', data)
  return { success: true, data: response.data }
}
```

**Ubicación**: `/home/ubuntu/cuenty_mvp/nextjs_space/lib/admin-auth.ts` (líneas 314-333)

---

### 2. Frontend - Página de Configuración (`nextjs_space/app/admin/config/page.tsx`)

#### 2.1. Nuevas Interfaces y Estados

```typescript
interface ChatwootConfig {
  chatwoot_url: string
  access_token: string
  account_id: string
}

// Estados agregados:
const [chatwootConfig, setChatwootConfig] = useState<ChatwootConfig>({...})
const [savingChatwoot, setSavingChatwoot] = useState(false)
const [chatwootStatus, setChatwootStatus] = useState<'loading' | 'success' | 'error' | null>(null)
```

#### 2.2. Nuevas Funciones

- **`fetchChatwootConfig()`**: Carga la configuración actual de Chatwoot desde el backend
- **`handleChatwootSubmit()`**: Guarda la configuración de Chatwoot con validaciones
- **`handleChatwootInputChange()`**: Maneja cambios en los campos del formulario

#### 2.3. Nuevo Formulario de Chatwoot

El formulario incluye:
- **Campo URL de Chatwoot**: Input tipo URL con validación
- **Campo Access Token**: Input tipo password para seguridad
- **Campo Account ID**: Input de texto para el ID de cuenta
- **Indicador de estado**: Badge visual que muestra el estado de la configuración
- **Botones de acción**: Guardar y Recargar configuración

---

### 3. Backend - Rutas de API Next.js

#### 3.1. Ruta para Evolution API (`app/api/admin/config/evolution/route.ts`)

**Endpoints**:
- `GET /api/admin/config/evolution` - Obtiene configuración de Evolution API
- `POST /api/admin/config/evolution` - Guarda/actualiza configuración de Evolution API

**Características**:
- Autenticación mediante JWT
- Validación de campos requeridos
- Creación automática de tabla si no existe
- Uso de Prisma para consultas SQL raw

#### 3.2. Ruta para Chatwoot (`app/api/admin/config/chatwoot/route.ts`)

**Endpoints**:
- `GET /api/admin/config/chatwoot` - Obtiene configuración de Chatwoot
- `POST /api/admin/config/chatwoot` - Guarda/actualiza configuración de Chatwoot

**Características**:
- Autenticación mediante JWT
- Validación de campos requeridos (URL, Access Token, Account ID)
- Validación de formato de URL
- Creación automática de tabla `chatwoot_config` si no existe
- Uso de Prisma para consultas SQL raw

**Estructura de la tabla `chatwoot_config`**:
```sql
CREATE TABLE chatwoot_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  chatwoot_url TEXT,
  access_token TEXT,
  account_id VARCHAR(50),
  activo BOOLEAN DEFAULT false,
  fecha_actualizacion TIMESTAMP DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
)
```

---

## 📊 Flujo de Datos

```
Usuario ingresa datos
      ↓
handleChatwootSubmit()
      ↓
Validación de campos
      ↓
adminApiService.saveChatwootConfig()
      ↓
POST /api/admin/config/chatwoot
      ↓
Verificación de autenticación JWT
      ↓
Validación de datos
      ↓
Creación/actualización en base de datos
      ↓
Respuesta al frontend
      ↓
Toast de confirmación
```

---

## 🎨 Interfaz de Usuario

### Estado Visual

La configuración de Chatwoot muestra diferentes estados:

- 🔄 **Verificando...** (azul): Cargando datos
- ✅ **Configurado correctamente** (verde): Configuración exitosa
- ❌ **Error en la configuración** (rojo): Error al guardar/cargar
- ⚠️ **Sin configurar** (amarillo): No hay configuración guardada

### Diseño Responsivo

- Compatible con dispositivos móviles y de escritorio
- Uso de Tailwind CSS para estilos consistentes
- Animaciones con Framer Motion para transiciones suaves
- Diseño consistente con el resto de la plataforma CUENTY

---

## 🔐 Seguridad

1. **Autenticación**: Todos los endpoints requieren token JWT válido
2. **Validación**: Validación de formato de URL y campos requeridos
3. **Sanitización**: Uso de prepared statements vía Prisma
4. **Almacenamiento seguro**: Access Token se muestra como password en el input

---

## 📝 Credenciales de Chatwoot

Según el contexto proporcionado:

```
URL: https://chat.whatscloud.site
Access Token: z8kpNiED3fW7KL6PcXoQJiQ4
Account ID: 3
```

---

## 🧪 Pruebas

Para probar la implementación:

1. Acceder a `/admin/config` (requiere autenticación)
2. Completar el formulario de Chatwoot con las credenciales
3. Hacer clic en "Guardar Configuración"
4. Verificar el mensaje de éxito y el estado actualizado
5. Recargar la página y verificar que los datos persistan

---

## 🔄 Integración con el Backend Existente

El backend de Express ya contiene los controladores necesarios:

- **Archivo**: `backend/controllers/adminController.js`
- **Métodos**: 
  - `obtenerConfigChatwoot` (línea 1639)
  - `guardarConfigChatwoot` (línea 1712)
- **Rutas**: 
  - `GET /api/admin/config/chatwoot` (línea 114 de adminRoutes.js)
  - `POST /api/admin/config/chatwoot` (línea 117 de adminRoutes.js)

Sin embargo, para este proyecto se implementaron rutas de API directamente en Next.js para mantener consistencia con el resto de la aplicación.

---

## 📂 Archivos Modificados/Creados

### Modificados:
1. `/home/ubuntu/cuenty_mvp/nextjs_space/lib/admin-auth.ts`
2. `/home/ubuntu/cuenty_mvp/nextjs_space/app/admin/config/page.tsx`

### Creados:
1. `/home/ubuntu/cuenty_mvp/nextjs_space/app/api/admin/config/evolution/route.ts`
2. `/home/ubuntu/cuenty_mvp/nextjs_space/app/api/admin/config/chatwoot/route.ts`
3. `/home/ubuntu/cuenty_mvp/CHATWOOT_CONFIG_UI.md` (este archivo)

---

## 🚀 Próximos Pasos

1. ✅ Configurar Chatwoot en el admin panel
2. ⏭️ Verificar la integración con los webhooks de Chatwoot
3. ⏭️ Probar el flujo completo de consultas desde Chatwoot
4. ⏭️ Implementar logs de auditoría para cambios de configuración

---

## 📞 Soporte

Para cualquier problema o consulta sobre esta implementación, revisar:
- Logs del servidor Next.js
- Logs de la base de datos PostgreSQL
- Respuestas de la API en la consola del navegador

---

**Fecha de implementación**: Octubre 24, 2025  
**Versión**: 1.0.0  
**Autor**: DeepAgent - Abacus.AI
