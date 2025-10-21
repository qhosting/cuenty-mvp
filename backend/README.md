# 🎬 CUENTY Backend API - E-Commerce Platform

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node](https://img.shields.io/badge/node-16+-green)
![PostgreSQL](https://img.shields.io/badge/postgresql-12+-blue)

Backend completo para plataforma e-commerce de cuentas de streaming con autenticación por teléfono, carrito de compras y gestión de órdenes.

## ✨ Características Principales

### 🔐 Autenticación Dual
- **Usuarios**: Registro y login con verificación por código SMS/WhatsApp (6 dígitos)
- **Administradores**: Login tradicional con username/password

### 🛒 E-Commerce Completo
- **Catálogo de Servicios**: Netflix, Disney+, HBO Max, Prime Video, Spotify
- **Planes Flexibles**: 1, 3, 6 y 12 meses para cada servicio
- **Precios Configurables**: Costo + Margen de ganancia = Precio de venta
- **Carrito de Compras**: Agregar, editar, eliminar items
- **Gestión de Órdenes**: Estados, pagos, entrega de credenciales

### 📦 Gestión de Inventario
- Inventario de cuentas con credenciales encriptadas
- Asignación automática de cuentas disponibles
- Estados: disponible, asignada, mantenimiento, bloqueada

### 💳 Pagos y Entrega
- Instrucciones de pago bancario automáticas
- 3 métodos de entrega: WhatsApp, Email, Panel Web
- Confirmación manual de pagos por admin

### 🎯 Panel de Administración
- Gestión de servicios y planes
- Control de precios (costo + margen)
- Gestión de órdenes y estados
- Asignación de credenciales
- Dashboard con estadísticas

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 3. Crear y configurar base de datos
psql -U postgres -c "CREATE DATABASE cuenty_db"

# Opción A: Usar Prisma Migrations (Recomendado)
npx prisma migrate deploy

# Opción B: Usar SQL directo (Legado)
# psql -U postgres -d cuenty_db -f ../database/schema.sql

# 4. Generar cliente de Prisma
npx prisma generate

# 5. Iniciar servidor
npm start

# O en modo desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### 🗄️ Gestión de Base de Datos con Prisma

Este proyecto usa **Prisma ORM** para gestionar el esquema de base de datos. Las migraciones están versionadas y se encuentran en `prisma/migrations/`.

#### Comandos de Prisma

```bash
# Aplicar migraciones en producción
npx prisma migrate deploy

# Crear nueva migración en desarrollo (después de modificar schema.prisma)
npx prisma migrate dev --name nombre_de_migracion

# Ver estado de migraciones
npx prisma migrate status

# Generar/actualizar cliente de Prisma
npx prisma generate

# Abrir Prisma Studio (GUI para la base de datos)
npx prisma studio

# Resetear base de datos (⚠️ elimina todos los datos)
npx prisma migrate reset
```

#### Estructura de Prisma

```
backend/
├── prisma/
│   ├── schema.prisma           # Esquema de base de datos
│   └── migrations/             # Historial de migraciones
│       ├── 20251021042116_init/
│       │   └── migration.sql
│       └── migration_lock.toml
```

**Importante para Producción:**
- Usar `npx prisma migrate deploy` (NO `prisma migrate dev`)
- Las migraciones se aplican automáticamente desde Git
- Nunca editar archivos de migración manualmente

## 📚 Documentación

- **[Guía de Instalación Completa](SETUP_GUIDE.md)** - Setup detallado paso a paso
- **[Documentación de API](API_DOCUMENTATION.md)** - Todos los endpoints con ejemplos
- **[Documentación PDF](API_DOCUMENTATION.pdf)** - Versión para imprimir

## 🔑 Credenciales por Defecto

```
Admin:
  username: admin
  password: admin123
  
⚠️ CAMBIAR EN PRODUCCIÓN
```

## 📡 Endpoints Principales

### Autenticación de Usuarios
```
POST   /api/auth/user/phone/request-code  # Solicitar código
POST   /api/auth/user/phone/verify-code   # Verificar y login
GET    /api/auth/user/profile              # Obtener perfil
PUT    /api/auth/user/profile              # Actualizar perfil
```

### Catálogo
```
GET    /api/servicios/activos              # Listar servicios
GET    /api/planes/activos                 # Listar planes
```

### Carrito
```
GET    /api/cart                           # Ver carrito
POST   /api/cart/items                     # Agregar item
PUT    /api/cart/items                     # Actualizar cantidad
DELETE /api/cart/items/:id                 # Eliminar item
```

### Órdenes
```
POST   /api/ordenes-new                    # Crear orden
GET    /api/ordenes-new/mis-ordenes        # Mis órdenes
GET    /api/ordenes-new/:id                # Detalle de orden
```

### Admin
```
GET    /api/ordenes-new                    # Todas las órdenes
PUT    /api/ordenes-new/:id/estado         # Cambiar estado
POST   /api/ordenes-new/items/:id/asignar  # Asignar credenciales
```

Ver todos los endpoints en [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## 🏗️ Arquitectura

```
┌─────────────────┐
│   Cliente Web   │
│  /React/Next.js │
└────────┬────────┘
         │
         │ HTTPS/REST
         │
┌────────▼────────┐
│   Express API   │
│   (Node.js)     │
├─────────────────┤
│ • Auth          │
│ • Validation    │
│ • Controllers   │
│ • Models        │
└────────┬────────┘
         │
         │ pg (PostgreSQL)
         │
┌────────▼────────┐
│  PostgreSQL DB  │
│ • 10+ Tablas    │
│ • Índices       │
│ • Triggers      │
└─────────────────┘
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales
- `usuarios` - Usuarios del sistema
- `phone_verifications` - Códigos de verificación
- `servicios` - Servicios de streaming
- `service_plans` - Planes con precios
- `shopping_cart` - Carrito de compras
- `ordenes` - Órdenes de compra
- `order_items` - Items de cada orden
- `inventario_cuentas` - Cuentas disponibles
- `payment_instructions` - Datos bancarios

Ver esquema completo en `/database/schema.sql`

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL 12+
- **ORM**: Prisma (migraciones versionadas)
- **Autenticación**: JWT (jsonwebtoken)
- **Seguridad**: Helmet, CORS, bcryptjs
- **Validación**: express-validator
- **Encriptación**: crypto-js

## 📦 Dependencias Principales

```json
{
  "express": "^4.18.2",
  "pg": "^8.11.3",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "express-validator": "^7.0.1",
  "helmet": "^7.1.0",
  "cors": "^2.8.5"
}
```

## 🧪 Testing

```bash
# Verificar salud del servidor
curl http://localhost:3000/health

# Login admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Listar servicios activos
curl http://localhost:3000/api/servicios/activos
```

## 🔐 Seguridad

- ✅ Passwords hasheados con bcrypt
- ✅ JWT para autenticación
- ✅ Validación de entrada en todos los endpoints
- ✅ Credenciales encriptadas en base de datos
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ Rate limiting (recomendado para producción)

## 📈 Monitoreo

```bash
# Ver logs
npm start 2>&1 | tee server.log

# Con PM2
pm2 start server.js --name cuenty-backend
pm2 logs cuenty-backend
pm2 monit
```

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
# Con PM2
npm install -g pm2
pm2 start server.js --name cuenty-backend -i max
pm2 startup
pm2 save
```

### Docker
```bash
docker build -t cuenty-backend .
docker run -p 3000:3000 --env-file .env cuenty-backend
```

## 🔄 Flujo de Trabajo

### Usuario (Compra)
1. Registro con teléfono → Código de verificación
2. Explorar catálogo de servicios
3. Agregar planes al carrito
4. Crear orden → Recibir instrucciones de pago
5. Realizar transferencia bancaria
6. Recibir credenciales por WhatsApp/Email/Web

### Admin (Gestión)
1. Login con credenciales
2. Ver órdenes pendientes
3. Verificar pago recibido
4. Actualizar estado a "pagada"
5. Asignar credenciales automáticamente
6. Marcar como entregada

## 🐛 Troubleshooting

### Puerto en uso
```bash
lsof -i :3000
kill -9 <PID>
```

### Error de conexión a DB
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar credenciales en .env
cat .env | grep DATABASE
```

### Problemas con tokens
- Verificar que JWT_SECRET esté configurado en .env
- Los tokens expiran en 7 días

## 📝 Variables de Entorno

```env
# Servidor
NODE_ENV=development
PORT=3000

# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/cuenty_db

# Seguridad
JWT_SECRET=tu-secreto-super-seguro-de-64-caracteres-minimo

# CORS
CORS_ORIGIN=*

# SMS (Opcional - Producción)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

ISC License - Ver [LICENSE](LICENSE) para más detalles

## 📞 Soporte

- **Documentación**: Ver [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Setup**: Ver [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Email**: admin@cuenty.com
- **Issues**: GitHub Issues

## 🎯 Roadmap

- [x] Autenticación con teléfono
- [x] Carrito de compras
- [x] Gestión de órdenes
- [x] Panel de administración
- [ ] Integración con SMS/WhatsApp
- [ ] Pagos en línea (Stripe/MercadoPago)
- [ ] Sistema de notificaciones
- [ ] Panel de analytics
- [ ] API de webhooks
- [ ] Rate limiting
- [ ] Tests automatizados

## 👥 Autores

CUENTY Team - 2024

---

**¡Gracias por usar CUENTY! 🎬**

Para más información, consulta la [documentación completa](API_DOCUMENTATION.md).
