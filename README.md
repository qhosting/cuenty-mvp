# 🎬 CUENTY - Plataforma de Gestión de Cuentas de Streaming

> Sistema completo para la venta y gestión automatizada de cuentas de servicios de streaming (Netflix, Disney+, HBO Max, Prime Video, Spotify, etc.)

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación Rápida](#-instalación-rápida)
- [Configuración](#-configuración)
- [Despliegue en Easypanel](#-despliegue-en-easypanel)
- [Uso del Sistema](#-uso-del-sistema)
- [API Reference](#-api-reference)
- [Integración con n8n](#-integración-con-n8n)
- [Seguridad](#-seguridad)
- [Solución de Problemas](#-solución-de-problemas)
- [Roadmap](#-roadmap)
- [Sistema de Versionado](#-sistema-de-versionado)

---

## ✨ Características

### 🎯 Funcionalidades Principales

- **🛒 E-commerce para Clientes**
  - Catálogo de servicios de streaming
  - Proceso de compra simplificado
  - Consulta de cuentas activas
  - Vista de credenciales seguras
  
- **👨‍💼 Panel de Administración**
  - Dashboard con métricas en tiempo real
  - Gestión completa de órdenes
  - Inventario de cuentas con encriptación
  - Sistema de tickets de soporte
  - Gestión de productos y precios
  - Administración de usuarios

- **🔐 Seguridad**
  - Encriptación AES-256 para credenciales
  - Autenticación JWT para administradores
  - Protección de webhooks
  - Variables de entorno para secrets
  
- **🤖 Automatización**
  - Asignación automática de cuentas
  - Integración con n8n para notificaciones
  - Sistema de recordatorios de vencimiento
  - Webhooks para WhatsApp (vía Evolution API)

### 💪 Ventajas Competitivas

- ✅ **Escalable**: Soporta ~100 clientes iniciales, fácilmente escalable
- ✅ **Seguro**: Credenciales encriptadas en base de datos
- ✅ **Automatizado**: Mínima intervención manual
- ✅ **Modular**: Fácil agregar nuevos servicios de streaming
- ✅ **Containerizado**: Deploy con un solo comando usando Docker

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    CUENTY PLATFORM                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐          ┌──────────────┐                │
│  │   Customer   │          │    Admin     │                │
│  │   Frontend   │          │   Frontend   │                │
│  │   (HTML/JS)  │          │   (HTML/JS)  │                │
│  └──────┬───────┘          └──────┬───────┘                │
│         │                          │                         │
│         └────────────┬─────────────┘                        │
│                      │                                       │
│              ┌───────▼────────┐                             │
│              │   Express API  │                             │
│              │   (Node.js)    │                             │
│              └───────┬────────┘                             │
│                      │                                       │
│         ┌────────────┼────────────┐                        │
│         │            │            │                         │
│    ┌────▼────┐  ┌───▼───┐  ┌────▼─────┐                  │
│    │PostgreSQL│  │n8n API│  │Evolution │                  │
│    │ Database │  │Webhooks│  │  API     │                  │
│    └──────────┘  └────────┘  └──────────┘                  │
│                      │            │                         │
│                      └────────────┴──────► WhatsApp        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 🗂️ Estructura del Proyecto

```
cuenty_mvp/
├── backend/                    # Backend API (Node.js/Express)
│   ├── config/                # Configuraciones
│   │   └── database.js       # Conexión a PostgreSQL
│   ├── controllers/           # Lógica de negocio
│   │   ├── authController.js
│   │   ├── productoController.js
│   │   ├── ordenController.js
│   │   ├── cuentaController.js
│   │   ├── ticketController.js
│   │   ├── usuarioController.js
│   │   └── webhookController.js
│   ├── middleware/            # Middlewares
│   │   ├── auth.js           # Autenticación JWT
│   │   └── webhookAuth.js    # Auth para webhooks
│   ├── models/                # Modelos de datos
│   │   ├── Usuario.js
│   │   ├── Producto.js
│   │   ├── Cuenta.js
│   │   ├── Orden.js
│   │   └── Ticket.js
│   ├── routes/                # Rutas de la API
│   │   ├── authRoutes.js
│   │   ├── productoRoutes.js
│   │   ├── ordenRoutes.js
│   │   ├── cuentaRoutes.js
│   │   ├── ticketRoutes.js
│   │   ├── usuarioRoutes.js
│   │   └── webhookRoutes.js
│   ├── utils/                 # Utilidades
│   │   └── encryption.js     # Encriptación AES
│   ├── public/                # Archivos estáticos
│   │   └── index.html        # Landing page API
│   ├── package.json
│   └── server.js             # Entry point
├── frontend/                  # Interfaces de usuario
│   ├── customer/             # Sitio para clientes
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── app.js
│   └── admin/                # Panel de administración
│       ├── index.html
│       ├── admin-styles.css
│       └── admin-app.js
├── database/                  # Scripts de base de datos
│   └── schema.sql            # Esquema completo
├── nextjs_space/              # Frontend Next.js (Nueva landing)
│   ├── app/                  # App Router de Next.js
│   ├── components/           # Componentes React
│   └── public/               # Assets estáticos
├── Dockerfile                 # Imagen Docker
├── docker-compose.yml         # Orquestación de servicios
├── start.sh                   # Script de inicio unificado
├── start-docker.sh            # Script para Docker
├── .env.example              # Ejemplo de variables de entorno
├── .dockerignore
├── .gitignore
└── README.md                 # Esta documentación
```

### 🔄 Sistema Unificado Backend + Frontend

CUENTY ahora utiliza un **sistema unificado** donde:

1. **Backend (Express)** corre en puerto **3000**
2. **Frontend (Next.js)** corre en puerto **3001** (interno)
3. El backend hace **proxy automático** al frontend para todas las rutas no-API

**Ventajas:**
- ✅ Un solo puerto de acceso: `http://localhost:3000`
- ✅ Sin problemas de CORS
- ✅ Configuración simplificada
- ✅ El proxy maneja automáticamente todas las rutas

**Rutas especiales que NO se envían al proxy:**
- `/api/*` - Todas las rutas de API
- `/health` - Health check del backend
- `/api-info` - Información de la API
- `/public/*` - Recursos estáticos del backend

**Todo lo demás se proxy al frontend Next.js**, incluyendo:
- `/` - Landing page
- `/customer/*` - Área de clientes
- `/admin/*` - Panel de administración (nuevo)
- Y cualquier otra ruta del frontend

---

## 📦 Requisitos Previos

### Mínimos (Desarrollo Local)

- **Node.js** 18 o superior
- **PostgreSQL** 15 o superior
- **npm** o **yarn**
- **Git** (para control de versiones)

### Recomendados (Producción)

- **Docker** 20.10+ y **Docker Compose** 2.0+
- **2 GB RAM** mínimo (4 GB recomendado)
- **20 GB de almacenamiento**
- **Dominio propio** (para HTTPS en producción)
- **Easypanel** o servidor VPS con Docker

---

## 🚀 Instalación Rápida

### Opción 1: Script Unificado (Recomendado para Desarrollo)

```bash
# 1. Ir al directorio del proyecto
cd /home/ubuntu/cuenty_mvp

# 2. Ejecutar script de inicio unificado
./start.sh

# 3. ¡Listo! Acceder a:
# - Sitio Web: http://localhost:3000
# - API Info: http://localhost:3000/api-info
# - Health: http://localhost:3000/health
```

El script `start.sh` hace todo automáticamente:
- ✅ Verifica e instala dependencias
- ✅ Inicia Next.js en puerto 3001
- ✅ Inicia Express en puerto 3000 con proxy
- ✅ Muestra logs en tiempo real
- ✅ Limpieza automática al presionar Ctrl+C

### Opción 2: Docker (Recomendado para Producción)

```bash
# 1. Construir imagen
docker build -t cuenty:latest .

# 2. Ejecutar contenedor
docker run -d -p 3000:3000 --name cuenty cuenty:latest

# 3. Ver logs
docker logs -f cuenty

# 4. Acceder a la aplicación
# Frontend Cliente: http://localhost:3000
# Panel Admin: http://localhost:3000/admin
```

### Opción 2: Instalación Manual

```bash
# 1. Instalar dependencias del backend
cd backend
npm install

# 2. Configurar PostgreSQL
# Crear base de datos
psql -U postgres -c "CREATE DATABASE cuenty_db;"

# Ejecutar schema
psql -U postgres -d cuenty_db -f ../database/schema.sql

# 3. Configurar variables de entorno
cp ../.env.example .env
nano .env

# 4. Iniciar servidor
npm start

# Servidor corriendo en http://localhost:3000
```

---

## ⚙️ Configuración

### Variables de Entorno

Edita el archivo `.env` con los siguientes valores:

```bash
# Entorno
NODE_ENV=production
PORT=3000

# Base de Datos
# OPCIÓN 1 (RECOMENDADA): Usar DATABASE_URL para bases de datos externas
# Formato: postgresql://usuario:password@host:puerto/nombre_db?sslmode=disable
DATABASE_URL=postgresql://postgres:tu_password@cloudmx_cuenty-db:5432/cuenty_db?sslmode=disable

# OPCIÓN 2 (ALTERNATIVA): Variables individuales (si no usas DATABASE_URL)
# Útil para desarrollo local o docker-compose con PostgreSQL interno
DB_HOST=postgres              # 'localhost' para desarrollo local
DB_PORT=5432
DB_NAME=cuenty_db
DB_USER=cuenty_user
DB_PASSWORD=TU_PASSWORD_SEGURO_AQUI

# Seguridad
JWT_SECRET=TU_SECRETO_JWT_MINIMO_32_CARACTERES
ENCRYPTION_KEY=TU_CLAVE_ENCRIPTACION_32_CARACTERES

# Webhooks n8n (Opcional)
N8N_WEBHOOK_SECRET=secret_compartido_con_n8n
N8N_WEBHOOK_ENTREGA_CUENTA=https://tu-n8n.com/webhook/entrega-cuenta
N8N_WEBHOOK_RESPUESTA_AGENTE=https://tu-n8n.com/webhook/respuesta-agente

# CORS
CORS_ORIGIN=*                # En producción: https://tu-dominio.com
```

> **💡 Nota**: El sistema prioriza `DATABASE_URL` si está definido. Si prefieres usar variables individuales, simplemente no definas `DATABASE_URL` o déjalo vacío.

### Generar Secretos Seguros

```bash
# Generar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar N8N_WEBHOOK_SECRET
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 🔐 Configuración de Administrador

#### Inicialización Automática

CUENTY crea automáticamente el usuario administrador al iniciar el backend usando las variables de entorno. **No necesitas crear el admin manualmente**.

**Variables de entorno para admin**:

```bash
# En tu archivo .env o en Easypanel:
ADMIN_EMAIL=admin@cuenty.top
ADMIN_PASSWORD=tu_password_seguro
ADMIN_SECRET=tu_secreto_jwt_para_admin
```

**¿Cómo funciona?**

1. Al iniciar el servidor backend, se ejecuta automáticamente el script `init-admin.js`
2. El script verifica si existe un admin con el username extraído del email
3. Si no existe, lo crea con las credenciales configuradas
4. Si ya existe, verifica y actualiza la contraseña si es diferente

**Ventajas**:
- ✅ No necesitas ejecutar scripts manualmente
- ✅ La contraseña se actualiza automáticamente si cambias las variables
- ✅ Funciona en desarrollo, staging y producción
- ✅ Ideal para contenedores efímeros (Docker/Kubernetes)

**Logs al iniciar**:

```bash
🔧 Inicializando usuario administrador...
📧 Email: admin@cuenty.top
👤 Username: admin
✅ Administrador creado exitosamente:
   ID: 1
   Username: admin
   Email: admin@cuenty.top
   Fecha: 2025-10-22T10:00:00.000Z
🔐 Credenciales de acceso:
   Email: admin@cuenty.top
   Password: tu_password_seguro
   URL: /admin/login
```

#### Login de Administrador

1. **Acceder al panel**: `https://tu-dominio.com/admin/login`
2. **Ingresar credenciales**:
   - Email: El configurado en `ADMIN_EMAIL`
   - Password: El configurado en `ADMIN_PASSWORD`
3. **El sistema acepta login por**:
   - ✅ Email completo (ej: `admin@cuenty.top`)
   - ✅ Username (ej: `admin`)

#### Cambiar Contraseña de Admin

Para cambiar la contraseña del administrador:

1. **Actualiza la variable de entorno**:
   ```bash
   # En .env o en Easypanel
   ADMIN_PASSWORD=nueva_password_super_segura
   ```

2. **Reinicia el servidor**:
   ```bash
   # Docker
   docker-compose restart app
   
   # Easypanel
   # Click en "Restart" en el panel de control
   ```

3. **El script detecta automáticamente el cambio** y actualiza la contraseña hasheada en la base de datos

#### Crear Admin Manualmente (Opcional)

Si prefieres crear un administrador manualmente:

```bash
# Opción 1: Via API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@cuenty.com"
  }'

# Opción 2: Directamente en PostgreSQL
# Generar hash de password
node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"

# Insertar en base de datos
psql -U cuenty_user -d cuenty_db -c \
  "INSERT INTO admins (username, password, email) 
   VALUES ('admin', 'HASH_GENERADO_AQUI', 'admin@cuenty.com');"
```

> **⚠️ Importante**: Si usas la inicialización automática con variables de entorno, el admin manual podría ser sobrescrito al reiniciar el servidor si el username coincide.

---

## 🌐 Despliegue en Easypanel

### Paso 1: Preparar el Repositorio

```bash
# 1. Inicializar git
cd /home/ubuntu/cuenty_mvp
git init

# 2. Crear repositorio en GitHub/GitLab
# y seguir las instrucciones para push inicial

git add .
git commit -m "Initial CUENTY MVP"
git remote add origin https://github.com/tu-usuario/cuenty-mvp.git
git push -u origin main
```

### Paso 2: Configurar en Easypanel

1. **Crear nuevo proyecto**
   - Nombre: `cuenty-mvp`
   - Tipo: Docker Compose

2. **Conectar repositorio Git**
   - URL: `https://github.com/tu-usuario/cuenty-mvp.git`
   - Branch: `main`

3. **Configurar variables de entorno**
   - Ir a Settings → Environment Variables
   - Agregar todas las variables del archivo `.env.example`
   - ⚠️ **IMPORTANTE**: Usar valores seguros en producción

4. **Configurar dominio**
   - Settings → Domains
   - Agregar tu dominio: `cuenty.tu-dominio.com`
   - Habilitar HTTPS automático

5. **Deploy**
   - Click en "Deploy"
   - Esperar ~3-5 minutos
   - Verificar logs en tiempo real

### Paso 3: Verificar Despliegue

```bash
# Verificar salud del servicio
curl https://cuenty.tu-dominio.com/health

# Debería responder:
# {"status":"ok","message":"CUENTY API is running"}
```

### Paso 4: Configurar Base de Datos Inicial

```bash
# Conectarse al contenedor de PostgreSQL en Easypanel
easypanel exec cuenty_postgres psql -U cuenty_user -d cuenty_db

# O usando la terminal de Easypanel:
# Services → cuenty_postgres → Terminal

# Verificar tablas
\dt

# Crear admin inicial (si no existe)
INSERT INTO admins (username, password, email) 
VALUES ('admin', 'HASH_PASSWORD_AQUI', 'admin@cuenty.com');
```

### 🔗 Conectar a Base de Datos Externa (Easypanel u otro servidor)

Si tienes una base de datos PostgreSQL en otro contenedor o servidor, puedes conectarte usando `DATABASE_URL`:

#### Configuración en Easypanel:

1. **En las Variables de Entorno del servicio**, agregar:
   ```
   DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_db?sslmode=disable
   ```

2. **Ejemplo para base de datos en otro contenedor Easypanel**:
   ```
   DATABASE_URL=postgresql://postgres:51056d26ddf0ddbbc77a@cloudmx_cuenty-db:5432/cuenty-db?sslmode=disable
   ```

3. **Notas importantes**:
   - El `host` debe ser el nombre del contenedor o IP del servidor de base de datos
   - Si está en la misma red Docker/Easypanel, usa el nombre del contenedor
   - Para conexiones externas, usa la IP o dominio del servidor
   - `sslmode=disable` es para conexiones locales; para producción externa considera `sslmode=require`

4. **Verificar conexión**:
   ```bash
   # Ver logs del contenedor para confirmar la conexión
   # Deberías ver: "✅ Conectado a la base de datos PostgreSQL"
   # Y: "📍 Conexión usando: DATABASE_URL"
   ```

#### Configuración Local (development):

1. Crear archivo `.env` en la raíz del proyecto:
   ```bash
   DATABASE_URL=postgresql://postgres:password@localhost:5432/cuenty_db?sslmode=disable
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=tu-secreto-jwt-desarrollo
   ENCRYPTION_KEY=tu-clave-encriptacion-desarrollo
   ```

2. Iniciar el servidor:
   ```bash
   cd backend
   npm start
   ```

---

## 🎮 Uso del Sistema

### Para Clientes

1. **Navegar al sitio**: `https://cuenty.tu-dominio.com`
2. **Ver servicios disponibles**
3. **Seleccionar servicio y hacer clic en "Comprar Ahora"**
4. **Ingresar número de celular** (con código de país, ej: +525512345678)
5. **Recibir datos SPEI para pago**
6. **Realizar transferencia bancaria**
7. **Enviar comprobante por WhatsApp**
8. **Recibir credenciales automáticamente** (en 10 minutos)
9. **Consultar cuentas activas** usando el número de celular

### Para Administradores

1. **Acceder al panel**: `https://cuenty.tu-dominio.com/admin`
2. **Login con credenciales de administrador**
3. **Dashboard**: Ver métricas en tiempo real
4. **Órdenes**: 
   - Ver órdenes pendientes
   - Aprobar pagos (asigna cuenta automáticamente)
   - Ver detalles de órdenes
5. **Productos**:
   - Agregar nuevos servicios
   - Editar precios y descripciones
   - Activar/desactivar productos
6. **Inventario de Cuentas**:
   - Agregar nuevas cuentas
   - Ver credenciales encriptadas
   - Cambiar estado (disponible, asignada, mantenimiento)
7. **Usuarios**:
   - Ver estadísticas de clientes
   - Consultar historial de compras
8. **Soporte**:
   - Ver tickets abiertos
   - Responder a clientes
   - Cambiar estado de tickets
   - Las respuestas se envían automáticamente por WhatsApp

---

## 📚 API Reference

### Base URL
```
http://localhost:3000/api
```

### Autenticación

Todas las rutas de administrador requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

### Endpoints Principales

#### 🔐 Autenticación

```bash
# Login de administrador
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

# Respuesta:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@cuenty.com"
    }
  }
}
```

#### 📦 Productos

```bash
# Listar productos activos (público)
GET /api/productos/activos

# Listar todos los productos (admin)
GET /api/productos
Authorization: Bearer <token>

# Crear producto (admin)
POST /api/productos
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre_servicio": "Netflix Premium",
  "descripcion": "Plan Premium 4 pantallas",
  "precio": 45.00,
  "duracion_dias": 30
}

# Actualizar producto (admin)
PUT /api/productos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "precio": 50.00,
  "activo": true
}
```

#### 🛒 Órdenes

```bash
# Crear orden (público)
POST /api/ordenes
Content-Type: application/json

{
  "celular_usuario": "+525512345678",
  "id_producto": 1,
  "monto_pagado": 45.00
}

# Obtener orden
GET /api/ordenes/:id

# Listar órdenes de un usuario
GET /api/ordenes/usuario/:celular

# Listar todas las órdenes (admin)
GET /api/ordenes?estado=pendiente_pago
Authorization: Bearer <token>

# Aprobar pago (admin)
POST /api/ordenes/:id/aprobar
Authorization: Bearer <token>
```

#### 🔑 Cuentas (Inventario)

```bash
# Todas las rutas requieren autenticación de admin

# Listar cuentas
GET /api/cuentas?id_producto=1&estado=disponible
Authorization: Bearer <token>

# Agregar cuenta al inventario
POST /api/cuentas
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_producto": 1,
  "correo": "cuenta@netflix.com",
  "contrasena": "password123",
  "perfil": "2",
  "pin": "1234"
}

# Ver credenciales de cuenta
GET /api/cuentas/:id
Authorization: Bearer <token>

# Actualizar estado de cuenta
PUT /api/cuentas/:id/estado
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "mantenimiento"
}
```

#### 🎫 Tickets de Soporte

```bash
# Crear ticket (público)
POST /api/tickets
Content-Type: application/json

{
  "celular_usuario": "+525512345678",
  "titulo_problema": "No puedo acceder a mi cuenta",
  "descripcion": "Cuando intento entrar me dice contraseña incorrecta"
}

# Ver ticket
GET /api/tickets/:id

# Listar todos los tickets (admin)
GET /api/tickets?estado=abierto
Authorization: Bearer <token>

# Agregar mensaje a ticket
POST /api/tickets/:id/mensajes
Content-Type: application/json

{
  "remitente": "agente",
  "cuerpo_mensaje": "Hola, he verificado tu cuenta y el problema está resuelto.",
  "nombre_agente": "Carlos"
}

# Actualizar estado (admin)
PUT /api/tickets/:id/estado
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "resuelto"
}
```

#### 🔗 Webhooks (n8n)

```bash
# Obtener datos de cuenta de una orden
GET /api/webhooks/n8n/obtener-cuenta?id_orden=123
X-Webhook-Secret: tu-secreto-webhook

# Obtener órdenes próximas a vencer
GET /api/webhooks/n8n/proximas-vencer?dias=3
X-Webhook-Secret: tu-secreto-webhook
```

---

## 🤖 Integración con n8n

### Prerequisito: Evolution API

CUENTY se integra con WhatsApp a través de Evolution API. Ver documentación completa en:
- `/home/ubuntu/cuenty_n8n/guia-n8n-evolution.md`

### Workflows Recomendados

#### 1. Notificación de Entrega de Cuenta

**Trigger**: Cuando admin aprueba un pago

**Flujo**:
1. Backend llama webhook n8n: `POST ${N8N_WEBHOOK_ENTREGA_CUENTA}`
2. n8n obtiene credenciales: `GET /api/webhooks/n8n/obtener-cuenta`
3. n8n formatea mensaje con credenciales
4. n8n envía por WhatsApp via Evolution API

#### 2. Recordatorio de Vencimiento

**Trigger**: Cron job diario

**Flujo**:
1. Backend consulta órdenes próximas a vencer: `GET /api/webhooks/n8n/proximas-vencer?dias=3`
2. Para cada orden, backend llama webhook n8n
3. n8n formatea mensaje de recordatorio
4. n8n envía por WhatsApp

#### 3. Detección y Creación de Ticket

**Trigger**: Cliente envía mensaje de WhatsApp

**Flujo**:
1. Evolution API detecta mensaje entrante
2. Evolution API envía webhook a n8n
3. n8n analiza contenido (palabras clave: "ayuda", "problema", etc.)
4. n8n crea ticket: `POST /api/tickets`
5. n8n confirma al cliente por WhatsApp

### Configuración en n8n

```javascript
// Ejemplo de nodo HTTP Request en n8n
// Para obtener credenciales de cuenta

Method: GET
URL: https://cuenty.tu-dominio.com/api/webhooks/n8n/obtener-cuenta
Query Parameters:
  - id_orden: {{$json.body.id_orden}}
Headers:
  - X-Webhook-Secret: tu-secreto-compartido

// Respuesta esperada:
{
  "success": true,
  "data": {
    "correo": "cuenta@netflix.com",
    "contrasena": "pass123",
    "perfil": "2",
    "pin": "1234",
    "fecha_vencimiento": "2025-11-15",
    "nombre_servicio": "Netflix Premium"
  }
}
```

---

## 🔒 Seguridad

### Prácticas Implementadas

✅ **Encriptación de datos sensibles**
- Credenciales de cuentas encriptadas con AES-256
- Claves almacenadas en variables de entorno

✅ **Autenticación JWT**
- Tokens con expiración de 7 días
- Middleware de verificación en rutas protegidas

✅ **Protección de webhooks**
- Secreto compartido para autenticar llamadas de n8n
- Headers personalizados

✅ **Validación de entrada**
- Express Validator en endpoints críticos
- Sanitización de datos

✅ **Helmet.js**
- Headers de seguridad HTTP

✅ **CORS configurado**
- Orígenes permitidos específicos en producción

### Recomendaciones Adicionales

1. **HTTPS obligatorio en producción**
   - Easypanel lo configura automáticamente
   
2. **Backups regulares**
   ```bash
   # Backup de base de datos
   docker exec cuenty_postgres pg_dump -U cuenty_user cuenty_db > backup_$(date +%Y%m%d).sql
   
   # Backup automatizado (cron)
   0 2 * * * docker exec cuenty_postgres pg_dump -U cuenty_user cuenty_db > /backups/cuenty_$(date +\%Y\%m\%d).sql
   ```

3. **Monitoreo de logs**
   ```bash
   # Ver logs de la aplicación
   docker-compose logs -f app
   
   # Ver logs de PostgreSQL
   docker-compose logs -f postgres
   ```

4. **Rotación de secretos**
   - Cambiar JWT_SECRET, ENCRYPTION_KEY cada 90 días
   - Actualizar contraseña de base de datos trimestralmente

---

## 🐛 Solución de Problemas

### Problema: Error de conexión a base de datos

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Reiniciar servicio
docker-compose restart postgres

# Verificar conectividad
docker exec cuenty_app nc -zv postgres 5432
```

### Problema: No se pueden desencriptar credenciales

```
Error: Error en la desencriptación
```

**Solución**: La ENCRYPTION_KEY cambió o es incorrecta

```bash
# Verificar que ENCRYPTION_KEY en .env coincide con la usada al encriptar
echo $ENCRYPTION_KEY

# Si necesitas re-encriptar todas las cuentas:
# 1. Exportar cuentas existentes (desencriptadas)
# 2. Cambiar ENCRYPTION_KEY
# 3. Re-insertar cuentas con nueva clave
```

### Problema: Login de admin no funciona

```bash
# Verificar que el admin existe
docker exec cuenty_postgres psql -U cuenty_user -d cuenty_db \
  -c "SELECT * FROM admins;"

# Crear nuevo admin
docker exec cuenty_postgres psql -U cuenty_user -d cuenty_db \
  -c "INSERT INTO admins (username, password, email) 
      VALUES ('admin', '\$2a\$10\$YourHashHere', 'admin@cuenty.com');"
```

### Problema: Webhooks de n8n no se reciben

```bash
# Verificar que N8N_WEBHOOK_SECRET coincide en ambos lados
# En backend (.env):
N8N_WEBHOOK_SECRET=mi-secreto-123

# En n8n (HTTP Request node, Headers):
X-Webhook-Secret: mi-secreto-123

# Verificar logs
docker-compose logs -f app | grep webhook

# Probar webhook manualmente
curl -X POST https://cuenty.tu-dominio.com/api/webhooks/n8n/obtener-cuenta \
  -H "X-Webhook-Secret: mi-secreto-123" \
  -H "Content-Type: application/json" \
  -d '{"id_orden": 1}'
```

### Problema: Puerto 3000 ya en uso

```bash
# Verificar qué usa el puerto
lsof -i :3000

# Cambiar puerto en .env
PORT=3001

# O matar el proceso
kill -9 $(lsof -t -i :3000)
```

---

## 🗺️ Roadmap

### Versión 1.1 (Próximo)

- [ ] Panel de estadísticas avanzadas
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Sistema de cupones y descuentos
- [ ] Notificaciones por email
- [ ] API de pagos automatizados (Stripe, PayPal)

### Versión 2.0 (Futuro)

- [ ] App móvil (React Native)
- [ ] Sistema de referidos
- [ ] Multi-tenancy (varios vendedores)
- [ ] Integración con más pasarelas de pago
- [ ] Sistema de renovación automática
- [ ] Dashboard de métricas de negocio

---

## 📦 Sistema de Versionado

CUENTY utiliza [Semantic Versioning](https://semver.org/lang/es/) (SemVer) para el control de versiones.

### Formato de Versión: `MAJOR.MINOR.PATCH`

- **MAJOR (X.0.0)**: Cambios incompatibles con versiones anteriores
- **MINOR (1.X.0)**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH (1.0.X)**: Correcciones de bugs y mejoras menores

### 🔍 Verificar Versión Actual

#### En Producción (API Endpoint)

```bash
# Verificar versión de la API en producción
curl https://tu-dominio.com/api/version

# Respuesta:
# {
#   "version": "1.0.0",
#   "environment": "production",
#   "timestamp": "2025-10-17T12:00:00.000Z",
#   "name": "cuenty-backend",
#   "description": "Backend API para CUENTY - Plataforma de gestión de cuentas de streaming"
# }
```

#### En Desarrollo (Logs del Servidor)

Al iniciar el servidor backend, verás la versión en los logs:

```bash
cd backend && npm run dev

# Output:
# ╔═══════════════════════════════════════════════════════════╗
# ║              🚀 CUENTY API - Sistema Iniciado             ║
# ╚═══════════════════════════════════════════════════════════╝
#   📦 Versión: 1.0.0
#   🌐 Puerto: 3000
#   📊 Entorno: development
#   ⏰ Timestamp: 2025-10-17T12:00:00.000Z
#   🔗 API Version: http://localhost:3000/api/version
# ╔═══════════════════════════════════════════════════════════╗
```

#### En el Frontend

La versión de la API se muestra automáticamente en:
- 🌐 **Footer de la landing page**: Badge con "API v1.0.0"
- 👨‍💼 **Panel de administración**: Sidebar inferior con versión

### 📝 Actualizar Versión (Antes de Deploy)

#### 1. Actualizar package.json del Backend

```bash
cd backend
npm version patch   # Para bug fixes (1.0.0 → 1.0.1)
npm version minor   # Para nuevas features (1.0.0 → 1.1.0)
npm version major   # Para breaking changes (1.0.0 → 2.0.0)
```

#### 2. Actualizar CHANGELOG.md

Documenta los cambios en `CHANGELOG.md` siguiendo el formato:

```markdown
## [1.1.0] - 2025-10-17

### ✨ Añadido
- Nueva funcionalidad X
- Nuevo endpoint Y

### 🐛 Corregido
- Bug en validación de formulario
- Error en cálculo de precios
```

#### 3. Commit y Push

```bash
# Hacer commit con mensaje descriptivo
git add .
git commit -m "chore: bump version to 1.1.0 - Added new features"
git tag v1.1.0
git push origin main --tags
```

#### 4. Verificar en Producción

Después del deploy, verifica que la versión se actualizó:

```bash
curl https://tu-dominio.com/api/version
```

### 📚 Documentación de Cambios

Consulta el archivo [`CHANGELOG.md`](./CHANGELOG.md) para ver el historial completo de cambios entre versiones.

### 🎯 Buenas Prácticas

1. **Siempre actualiza la versión antes de hacer deploy a producción**
2. **Documenta todos los cambios en CHANGELOG.md**
3. **Usa tags de git para marcar releases** (`git tag v1.0.0`)
4. **Mantén la versión del frontend sincronizada con el backend** (opcional)
5. **Informa a los usuarios sobre breaking changes** en versiones MAJOR

### 🔗 Endpoints de Versión

| Endpoint | Método | Descripción | Público |
|----------|--------|-------------|---------|
| `/api/version` | GET | Información de versión actual | ✅ Sí |
| `/` | GET | Info general de la API (incluye versión) | ✅ Sí |

---

## 📞 Soporte

¿Necesitas ayuda? Contacta al equipo de desarrollo:

- 📧 Email: soporte@cuenty.com
- 💬 WhatsApp: +52 55 1234 5678
- 📖 Documentación: [GitHub Wiki](https://github.com/tu-usuario/cuenty-mvp/wiki)

---

## 📄 Licencia

Este proyecto es propiedad privada de CUENTY. Todos los derechos reservados.

**© 2025 CUENTY. Prohibida su reproducción total o parcial sin autorización.**

---

## 🙏 Créditos

Desarrollado con ❤️ por el equipo CUENTY

**Stack Tecnológico**:
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
- [n8n](https://n8n.io/)
- [Evolution API](https://github.com/EvolutionAPI/evolution-api)

---

**¡Gracias por usar CUENTY! 🎬✨**
