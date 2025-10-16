# 🚀 CUENTY - Guía de Inicio Rápido

## Instalación Express (5 minutos)

### Con Docker (Recomendado)

```bash
# 1. Ejecutar script de setup
./setup.sh

# 2. ¡Listo! Accede a:
# - Cliente: http://localhost:3000
# - Admin: http://localhost:3000/admin
```

### Sin Docker

```bash
# 1. Instalar dependencias
cd backend && npm install

# 2. Configurar PostgreSQL
createdb cuenty_db
psql cuenty_db < ../database/schema.sql

# 3. Iniciar servidor
npm start
```

## Primeros Pasos

### 1. Crear Administrador

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","email":"admin@cuenty.com"}'
```

### 2. Login en Panel Admin

1. Ir a: http://localhost:3000/admin
2. Usuario: `admin`
3. Password: `admin123`

### 3. Agregar Productos

En el panel admin:
1. Click en "Productos"
2. "Nuevo Producto"
3. Llenar formulario
4. Guardar

### 4. Agregar Cuentas al Inventario

1. Click en "Inventario"
2. "Nueva Cuenta"
3. Seleccionar producto
4. Ingresar credenciales
5. Guardar

### 5. Probar Compra

1. Ir a: http://localhost:3000 (sitio cliente)
2. Seleccionar servicio
3. Ingresar celular
4. Confirmar compra

### 6. Aprobar Pago

1. En panel admin, ir a "Órdenes"
2. Buscar orden pendiente
3. Click en "✅ Aprobar"
4. ¡La cuenta se asigna automáticamente!

## Comandos Útiles

```bash
# Ver logs
docker-compose logs -f app

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Backup de base de datos
docker exec cuenty_postgres pg_dump -U cuenty_user cuenty_db > backup.sql

# Restaurar backup
docker exec -i cuenty_postgres psql -U cuenty_user cuenty_db < backup.sql
```

## Configuración Adicional

### Conectar a Base de Datos Externa

Si tienes PostgreSQL en otro contenedor/servidor:

1. Agregar en `.env`:
   ```
   DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_db?sslmode=disable
   ```

2. Ejemplo para Easypanel:
   ```
   DATABASE_URL=postgresql://postgres:password@cloudmx_cuenty-db:5432/cuenty-db?sslmode=disable
   ```

3. El sistema usará `DATABASE_URL` automáticamente si está definido

### Configurar n8n (Opcional)

1. Ver guía completa: `/home/ubuntu/cuenty_n8n/guia-n8n-evolution.md`
2. Actualizar en `.env`:
   ```
   N8N_WEBHOOK_ENTREGA_CUENTA=https://tu-n8n.com/webhook/...
   N8N_WEBHOOK_RESPUESTA_AGENTE=https://tu-n8n.com/webhook/...
   ```

### Configurar Dominio Personalizado

En Easypanel:
1. Settings → Domains
2. Agregar: `cuenty.tu-dominio.com`
3. Habilitar SSL automático
4. Actualizar CORS_ORIGIN en `.env`

---

¿Problemas? Ver [README.md](README.md) sección "Solución de Problemas"
