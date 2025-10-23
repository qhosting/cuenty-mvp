# 🎬 CUENTY MVP - Sistema de Gestión de Suscripciones de Streaming

<div align="center">

![CUENTY Logo](./CUENTY.png)

**Plataforma completa para la venta y gestión de suscripciones de servicios de streaming**

[![Version](https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Blue_Python_3.10%2B_Shield_Badge.svg/2560px-Blue_Python_3.10%2B_Shield_Badge.svg.png)
[![License](https://i.ytimg.com/vi/4cgpu9L2AE8/maxresdefault.jpg)
[![Status](https://carbondesignsystem.com/static/8fc7809bc05a9e7ef8d04db3d58822c5/3cbba/status-overview.png)

[Demo](#) · [Documentación](#) · [Reportar Bug](https://github.com/qhosting/cuenty-mvp/issues) · [Solicitar Feature](https://github.com/qhosting/cuenty-mvp/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Fases del Proyecto](#-fases-del-proyecto)
- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Seguridad](#-seguridad)
- [Testing](#-testing)
- [Despliegue](#-despliegue)
- [Contribuir](#-contribuir)
- [Roadmap](#-roadmap)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## 🎯 Acerca del Proyecto

CUENTY es una plataforma completa que permite a emprendedores gestionar y vender suscripciones de servicios de streaming de manera eficiente y segura. El sistema incluye un panel de administración robusto y una interfaz de usuario intuitiva para clientes.

### ¿Por qué CUENTY?

- ✅ **Gestión Centralizada**: Administra múltiples servicios y planes desde un solo lugar
- ✅ **Automatización**: Asignación automática de cuentas y notificaciones por WhatsApp
- ✅ **Escalable**: Arquitectura preparada para crecer con tu negocio
- ✅ **Seguro**: Validaciones robustas y protección contra ataques comunes
- ✅ **Robusto**: Sistema listo para producción con datos reales

---

## 🚀 Fases del Proyecto

### ✅ Fase 1: UI del Admin (Completada)
- Diseño responsive y moderno
- Espaciado y layout optimizados
- Navegación intuitiva

### ✅ Fase 2: Funcionalidad del Catálogo (Completada)
- CRUD completo de servicios
- CRUD completo de planes
- Login funcional
- Integración con backend

### ✅ Fase 3: Sistema Robusto para Producción (Completada)
- **Validaciones Robustas**: Frontend y backend
- **Manejo de Errores**: Completo y user-friendly
- **Flujos de Producción**: Gestión de pedidos, cuentas y catálogo
- **Seguridad**: Rate limiting, sanitización, validaciones
- **UX/UI Mejorada**: Confirmaciones, feedback visual, loading states
- **Documentación**: Completa y detallada

---

## ✨ Características

### Panel de Administración

#### 🎬 Gestión de Servicios
- Crear, editar y eliminar servicios de streaming
- Activar/desactivar servicios
- Validación de duplicados
- Búsqueda en tiempo real

#### 💳 Gestión de Planes
- Crear planes personalizados por duración
- Configuración de precios y márgenes
- Filtrado por servicio
- Validación de dependencias

#### 📦 Gestión de Órdenes
- Visualización de pedidos con filtros
- Cambio de estados con validaciones
- Historial de transacciones
- Notas de administrador

#### 🔑 Gestión de Cuentas
- Inventario de cuentas de streaming
- Estados de cuenta (disponible, asignada, mantenimiento, bloqueada)
- Asignación automática a pedidos
- Validaciones de uso

#### 📊 Dashboard
- Estadísticas en tiempo real
- Gráficos de ventas
- Top servicios más vendidos
- Métricas de rendimiento

#### ⚙️ Configuración
- Integración con Evolution API (WhatsApp)
- Configuración de métodos de pago
- Personalización del sistema

### Seguridad y Validaciones

#### 🛡️ Backend
- Validación completa de todos los inputs
- Sanitización contra XSS e inyección SQL
- Rate limiting por tipo de operación
- Transiciones de estado validadas
- Verificación de dependencias
- Try-catch completo con manejo de errores

#### 🔒 Frontend
- Validación en tiempo real
- Mensajes de error específicos
- Indicadores visuales
- Confirmaciones para acciones destructivas
- Manejo de errores de red

---

## 🏗️ Arquitectura

```
cuenty_mvp/
├── backend/                    # Servidor Express + PostgreSQL
│   ├── config/                # Configuración de BD y otros
│   ├── controllers/           # Controladores de rutas
│   ├── middleware/            # Middleware (auth, rate limiting)
│   ├── models/                # Modelos de datos
│   ├── routes/                # Definición de rutas
│   ├── utils/                 # Utilidades y validadores
│   ├── prisma/                # Schema y migraciones Prisma
│   └── server.js              # Punto de entrada
│
├── nextjs_space/              # Frontend Next.js 14
│   ├── app/                   # App Router de Next.js
│   │   ├── admin/            # Panel de administración
│   │   ├── catalog/          # Catálogo público
│   │   └── ...
│   ├── components/            # Componentes reutilizables
│   ├── lib/                   # Utilidades y validadores
│   └── public/                # Archivos estáticos
│
├── SECURITY.md                # Guía de seguridad
├── README.md                  # Este archivo
└── .env.example               # Ejemplo de variables de entorno
```

---

## 🛠️ Tecnologías

### Backend
- **Node.js** 18+
- **Express.js** 4.18
- **PostgreSQL** 14+
- **Prisma ORM** 5.0
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas
- **express-rate-limit** para rate limiting

### Frontend
- **Next.js** 14 (App Router)
- **React** 18
- **TypeScript** 5
- **Tailwind CSS** 3
- **Framer Motion** para animaciones
- **React Hot Toast** para notificaciones
- **Lucide React** para iconos

### Infraestructura
- **PostgreSQL** (Base de datos)
- **Evolution API** (WhatsApp)
- **Vercel** o **Railway** (Despliegue recomendado)

---

## 📦 Instalación

### Prerrequisitos

```bash
Node.js 18+
PostgreSQL 14+
npm o yarn
Git
```

### Clonar el Repositorio

```bash
git clone https://github.com/qhosting/cuenty-mvp.git
cd cuenty-mvp
```

### Instalar Dependencias

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd nextjs_space
npm install
```

---

## ⚙️ Configuración

### 1. Variables de Entorno

#### Backend (.env)
```env
# Base de datos
DATABASE_URL="postgresql://user:password@host:5432/cuenty_db?schema=public"

# JWT
JWT_SECRET="tu_secret_key_muy_seguro_aqui"

# Servidor
PORT=5000
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Configurar Base de Datos

```bash
cd backend

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Seed de datos de prueba
npx prisma db seed
```

### 3. Crear Usuario Administrador

```sql
-- Conectar a PostgreSQL y ejecutar:
INSERT INTO admins (username, password, email)
VALUES (
  'admin',
  '$2a$10$...',  -- Hash de 'admin123' (cambiar en producción)
  'admin@cuenty.com'
);
```

O usar el script de seed:
```bash
npm run seed
```

---

## 🚀 Uso

### Desarrollo

#### Backend
```bash
cd backend
npm run dev
# Servidor en http://localhost:5000
```

#### Frontend
```bash
cd nextjs_space
npm run dev
# App en http://localhost:3000
```

### Producción

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd nextjs_space
npm run build
npm start
```

---

## 🔐 Seguridad

CUENTY implementa múltiples capas de seguridad. Para información detallada, consulta [SECURITY.md](./SECURITY.md).

### Highlights

- ✅ Validaciones robustas en backend y frontend
- ✅ Rate limiting por tipo de operación
- ✅ Sanitización contra XSS e inyección SQL
- ✅ Autenticación JWT con middleware
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Manejo seguro de errores
- ✅ Validación de transiciones de estado
- ✅ Verificación de dependencias antes de eliminar

### Rate Limits Configurados

| Operación | Límite | Ventana |
|-----------|--------|---------|
| General | 100 req | 15 min |
| Login | 5 intentos | 15 min |
| Crear recursos | 20 req | 1 hora |
| API Pública | 50 req | 15 min |

---

## 🧪 Testing

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd nextjs_space
npm test
```

### Testing Manual

1. **Servicios**: Crear, editar, eliminar con validaciones
2. **Planes**: Crear planes para diferentes servicios
3. **Órdenes**: Cambiar estados y verificar transiciones
4. **Cuentas**: Gestionar inventario y asignaciones
5. **Login**: Probar límite de intentos

---

## 🌐 Despliegue

### Backend (Railway/Render)

1. Conectar repositorio
2. Configurar variables de entorno
3. Agregar PostgreSQL addon
4. Desplegar

### Frontend (Vercel)

```bash
cd nextjs_space
vercel --prod
```

### Variables de Entorno en Producción

⚠️ **IMPORTANTE**: Actualizar todas las variables para producción:
- Cambiar `JWT_SECRET`
- Usar HTTPS en todas las URLs
- Configurar `NODE_ENV=production`
- Habilitar rate limiting en servidor

---

## 🤝 Contribuir

Las contribuciones son bienvenidas y apreciadas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Seguir las convenciones de código existentes
- Agregar tests para nuevas funcionalidades
- Actualizar documentación según sea necesario
- Verificar que todas las validaciones funcionen

---

## 🗺️ Roadmap

### Fase 4: Automatización Completa (Próxima)
- [ ] Asignación automática de cuentas a pedidos
- [ ] Notificaciones automáticas por WhatsApp
- [ ] Emails transaccionales
- [ ] Sistema de renovaciones automáticas

### Fase 5: Features Avanzadas
- [ ] Panel de usuario (cliente)
- [ ] Sistema de tickets de soporte
- [ ] Reportes y analytics avanzados
- [ ] Multi-moneda
- [ ] Multi-idioma

### Mejoras Continuas
- [ ] Tests automatizados completos
- [ ] CI/CD pipeline
- [ ] Documentación API (Swagger)
- [ ] Mobile app (React Native)

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

---

## 📞 Contacto

**Proyecto CUENTY**
- Website: [cuenty.com](https://cuenty.com)
- Email: contact@cuenty.com
- GitHub: [@qhosting](https://github.com/qhosting)

**Reporte de Bugs**: [GitHub Issues](https://github.com/qhosting/cuenty-mvp/issues)

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

---

<div align="center">

**⭐ Si te gusta CUENTY, dale una estrella en GitHub! ⭐**

Hecho con ❤️ por el equipo de CUENTY

[↑ Volver arriba](#-cuenty-mvp---sistema-de-gestión-de-suscripciones-de-streaming)

</div>
