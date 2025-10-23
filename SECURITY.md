# 🔐 CUENTY MVP - Guía de Seguridad

## Fase 3: Sistema Robusto para Producción

Este documento describe las medidas de seguridad implementadas en CUENTY MVP Fase 3 para proteger el sistema y los datos de los usuarios.

---

## 📋 Tabla de Contenidos

1. [Validaciones Robustas](#validaciones-robustas)
2. [Manejo de Errores](#manejo-de-errores)
3. [Autenticación y Autorización](#autenticación-y-autorización)
4. [Protección contra Ataques](#protección-contra-ataques)
5. [Rate Limiting](#rate-limiting)
6. [Gestión de Datos Sensibles](#gestión-de-datos-sensibles)
7. [Flujos de Producción](#flujos-de-producción)
8. [Recomendaciones Adicionales](#recomendaciones-adicionales)

---

## 🛡️ Validaciones Robustas

### Backend

#### Validaciones Implementadas

- **Servicios de Streaming:**
  - Nombre: 3-100 caracteres (requerido)
  - Descripción: máximo 500 caracteres
  - Logo URL: formato HTTP/HTTPS válido
  - Verificación de duplicados por nombre
  - Validación de dependencias antes de eliminar

- **Planes de Servicio:**
  - Nombre: 3-100 caracteres (requerido)
  - Duración: 1-36 meses
  - Precio: mayor a 0
  - Verificación de existencia del servicio asociado
  - Validación de duplicados (servicio + duración)
  - Validación de pedidos activos antes de eliminar

- **Cuentas de Streaming:**
  - Correo: formato de email válido (requerido)
  - Contraseña: mínimo 6 caracteres (requerido)
  - Perfil: máximo 50 caracteres
  - PIN: máximo 10 caracteres
  - Notas: máximo 500 caracteres
  - Estado: enum ['disponible', 'asignada', 'mantenimiento', 'bloqueada']
  - Verificación de duplicados (correo + plan)
  - Validación de uso en pedidos antes de eliminar/modificar

- **Órdenes:**
  - Estados válidos: ['pendiente', 'pendiente_pago', 'pagada', 'en_proceso', 'entregada', 'cancelada']
  - Transiciones de estado validadas
  - Notas de admin: máximo 1000 caracteres
  - Timestamps automáticos según estado

#### Archivo de Validación
```javascript
// /backend/utils/validators.js
- validateServicioData()
- validatePlanData()
- validateCuentaData()
- validateOrdenEstado()
- validateOrdenUpdate()
```

### Frontend

#### Validaciones Implementadas

- **Formularios de Servicios:**
  - Validación en tiempo real
  - Mensajes de error específicos por campo
  - Indicadores visuales (bordes rojos)
  - Limpieza de errores al corregir

- **Formularios de Planes:**
  - Validación de rangos numéricos
  - Verificación de selección de servicio
  - Mensajes de error claros

#### Archivo de Validación
```typescript
// /nextjs_space/lib/validators.ts
- validateServiceData()
- validatePlanData()
- validateAccountData()
- validatePhoneNumber()
```

---

## ⚠️ Manejo de Errores

### Backend

#### Códigos de Estado HTTP
- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Error de validación del cliente
- **404**: Recurso no encontrado
- **409**: Conflicto (duplicado)
- **429**: Demasiadas peticiones (rate limit)
- **500**: Error interno del servidor

#### Estructura de Respuesta de Error
```javascript
{
  success: false,
  message: "Descripción del error",
  errors: ["Error 1", "Error 2"], // Array de errores de validación
  error: "Detalles técnicos" // Solo en desarrollo
}
```

#### Try-Catch Completo
- Todos los controladores envueltos en try-catch
- Logging de errores en consola
- Mensajes de error user-friendly
- Detalles técnicos solo en modo desarrollo

### Frontend

#### Manejo de Errores
- Toasts para notificaciones
- Estados de loading
- Manejo de errores de red
- Mensajes descriptivos para el usuario
- Retry logic para operaciones críticas

---

## 🔑 Autenticación y Autorización

### Middleware de Autenticación

#### Verificación de Token
```javascript
// /backend/middleware/auth.js
- verifyToken: Valida JWT
- verifyAdmin: Verifica rol de administrador
```

#### Rutas Protegidas
Todas las rutas de admin requieren autenticación:
- `verifyToken`: Valida token JWT
- `verifyAdmin`: Verifica permisos de administrador

### Tokens JWT
- Almacenamiento: localStorage (frontend)
- Expiración: Configurable en `.env`
- Renovación: Implementar refresh tokens (recomendado)

---

## 🛡️ Protección contra Ataques

### XSS (Cross-Site Scripting)

#### Sanitización de Inputs
```javascript
// Backend
const sanitizeText = (value) => {
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
```

#### Frontend
- Validación de URLs
- Escape de caracteres especiales
- No usar `dangerouslySetInnerHTML` sin sanitizar

### SQL Injection

#### Queries Parametrizadas
```javascript
// ✅ Correcto - Parametrizado
await pool.query('SELECT * FROM servicios WHERE id_servicio = $1', [id]);

// ❌ Incorrecto - Vulnerable
await pool.query(`SELECT * FROM servicios WHERE id_servicio = ${id}`);
```

### CSRF (Cross-Site Request Forgery)

#### Medidas Implementadas
- Tokens JWT en headers
- Validación de origen
- SameSite cookies (recomendado)

---

## ⏱️ Rate Limiting

### Limitadores Implementados

#### General
```javascript
// 100 peticiones por 15 minutos
generalLimiter
```

#### Autenticación
```javascript
// 5 intentos por 15 minutos
authLimiter
```

#### Creación de Recursos
```javascript
// 20 peticiones por hora
createLimiter
```

#### API Pública
```javascript
// 50 peticiones por 15 minutos
apiLimiter
```

### Aplicación
```javascript
// /backend/routes/adminRoutes.js
const { authLimiter, createLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, authController.loginAdmin);
router.post('/services', verifyToken, verifyAdmin, createLimiter, adminController.crearServicio);
```

---

## 🔒 Gestión de Datos Sensibles

### Encriptación

#### Contraseñas
```javascript
// bcryptjs para hash de contraseñas
const hashedPassword = await bcrypt.hash(password, 10);
```

#### Credenciales de Cuentas
Las credenciales de streaming se almacenan encriptadas en la base de datos:
- Campo: `correo_encriptado`
- Campo: `contrasena_encriptada`

### Variables de Entorno

#### Archivo .env
```env
# No versionar este archivo
.gitignore debe incluir .env

# Variables críticas
DATABASE_URL=postgresql://...
JWT_SECRET=tu_secret_key_aqui
NODE_ENV=production
```

#### Ejemplo .env.example
```env
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET=tu_secret_key_muy_seguro
PORT=5000
NODE_ENV=development
```

---

## 🔄 Flujos de Producción

### Gestión de Pedidos

#### Transiciones de Estado Válidas
```
pendiente → pendiente_pago, cancelada
pendiente_pago → pagada, cancelada
pagada → en_proceso, cancelada
en_proceso → entregada, cancelada
entregada → [final]
cancelada → [final]
```

#### Validaciones
- No permitir cambios inválidos de estado
- Registrar fecha de pago al marcar como "pagada"
- Registrar fecha de entrega al marcar como "entregada"
- Historial de cambios (implementar auditoría)

### Gestión de Cuentas

#### Estados de Cuenta
- **disponible**: Cuenta lista para asignar
- **asignada**: Cuenta asignada a un pedido
- **mantenimiento**: Cuenta en mantenimiento
- **bloqueada**: Cuenta bloqueada temporalmente

#### Reglas de Negocio
- Una cuenta no se puede asignar a múltiples pedidos activos
- No se puede eliminar una cuenta asignada a un pedido activo
- No se puede cambiar el estado de una cuenta asignada sin verificar el pedido

### Gestión de Catálogo

#### Servicios
- No se puede eliminar un servicio con planes activos
- Verificar duplicados por nombre (case-insensitive)
- Soft delete recomendado (desactivar en lugar de eliminar)

#### Planes
- No se puede eliminar un plan con pedidos activos
- Un servicio no puede tener dos planes con la misma duración
- Verificar existencia del servicio antes de crear

---

## 💡 Recomendaciones Adicionales

### Para Producción

#### 1. HTTPS Obligatorio
```javascript
// Middleware para forzar HTTPS
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});
```

#### 2. Helmet para Headers de Seguridad
```javascript
const helmet = require('helmet');
app.use(helmet());
```

#### 3. CORS Configurado
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

#### 4. Rate Limiting en Nginx/Load Balancer
- Configurar rate limiting a nivel de servidor
- Protección contra DDoS
- IP whitelisting para admin

#### 5. Logging y Monitoreo
```javascript
// Winston para logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

#### 6. Auditoría de Acciones Críticas
- Registrar todos los cambios de estado de órdenes
- Registrar creación/eliminación de cuentas
- Registrar accesos de admin
- Guardar IP y timestamp de acciones

#### 7. Backup Regular de Base de Datos
```bash
# Script de backup diario
pg_dump -U username dbname > backup_$(date +%Y%m%d).sql
```

#### 8. Actualización de Dependencias
```bash
# Verificar vulnerabilidades
npm audit

# Actualizar dependencias
npm update
```

#### 9. Pruebas de Seguridad
- Penetration testing
- Vulnerability scanning
- Code review de seguridad

#### 10. Documentación de Seguridad para el Equipo
- Políticas de contraseñas
- Procedimientos de respuesta a incidentes
- Contactos de emergencia

---

## 📞 Contacto y Reporte de Vulnerabilidades

Si encuentras alguna vulnerabilidad de seguridad, por favor repórtala de inmediato a:

**Email de Seguridad**: security@cuenty.com (configurar)

### Información a Incluir
- Descripción de la vulnerabilidad
- Pasos para reproducir
- Impacto potencial
- Sugerencias de mitigación (opcional)

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Última actualización**: Octubre 2025
**Versión**: 3.0 (Fase 3 - Producción Ready)
