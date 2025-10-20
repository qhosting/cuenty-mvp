# Problema: Página /catalogo no carga en producción

## Resumen del Problema

La página `/catalogo` en producción (https://cuenty.top/catalogo) se queda en estado de loading infinito y no muestra los productos. 

### Causa Raíz Identificada

La API `/api/products` está devolviendo el error:
```json
{"error":"Ruta no encontrada"}
```

Este mensaje **NO** proviene del código de Next.js, sino de la infraestructura del servidor de producción (posiblemente Nginx, Apache, o un servicio de proxy).

## Cambios Implementados

### 1. Mejoras en el manejo de errores (✅ Completado)

**Archivo:** `app/catalogo/page.tsx`

- Agregado manejo robusto de errores en la función `fetchProducts`
- La página ahora verifica el status de la respuesta HTTP
- Si hay error, muestra un array vacío en lugar de quedarse en loading
- Evita el estado de loading infinito

**Código modificado:**
```typescript
const fetchProducts = async () => {
  try {
    const response = await fetch('/api/products')
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }
    
    setProducts(data)
  } catch (error) {
    console.error('Error fetching products:', error)
    setProducts([]) // Mostrar array vacío en lugar de loading infinito
  } finally {
    setLoading(false) // Siempre salir del estado de loading
  }
}
```

### 2. Logs mejorados en la API (✅ Completado)

**Archivo:** `app/api/products/route.ts`

- Agregados logs detallados para debugging
- Mensajes de error más descriptivos con detalles específicos
- Facilita la identificación de problemas en producción

**Logs agregados:**
```typescript
console.log('[API] GET /api/products - Iniciando...')
console.log('[API] Consultando productos con filtros:', where)
console.log(`[API] Productos encontrados: ${products.length}`)
```

## Estado Actual

### ✅ Funcionamiento Local
- La API responde correctamente con 32 productos
- La página del catálogo se renderiza sin problemas
- Los filtros funcionan correctamente

### ❌ Problema en Producción
- La API devuelve "Ruta no encontrada"
- Indica un problema de configuración del servidor, no del código

## Acciones Necesarias en Producción

### 1. Verificar que Next.js está corriendo

El servidor debe estar ejecutando Next.js en modo producción, no sirviendo archivos estáticos.

**Verificar proceso:**
```bash
# En el servidor de producción
ps aux | grep next
# Debería mostrar un proceso de Node.js ejecutando Next.js
```

### 2. Verificar configuración del servidor web

Si hay un Nginx o Apache frente a Next.js, debe estar configurado para hacer proxy de las solicitudes API.

**Configuración correcta de Nginx (ejemplo):**
```nginx
location /api/ {
    proxy_pass http://localhost:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### 3. Verificar variables de entorno

El archivo `.env` en producción debe tener:
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://cuenty.top"
NEXTAUTH_SECRET="..."
```

### 4. Re-desplegar la aplicación

Después de hacer pull de los últimos cambios:

```bash
# En el servidor de producción
cd /ruta/al/proyecto
git pull origin main
npm install
npm run build
pm2 restart cuenty  # o el comando equivalente para reiniciar
```

### 5. Verificar logs del servidor

```bash
# Ver logs de Next.js
pm2 logs cuenty
# o
tail -f /var/log/nextjs.log

# Buscar los nuevos logs agregados:
# [API] GET /api/products - Iniciando...
# [API] Consultando productos con filtros: ...
# [API] Productos encontrados: 32
```

## Pruebas a Realizar

### 1. Probar la API directamente
```bash
curl https://cuenty.top/api/products
```

**Respuesta esperada:** Array JSON con productos

**Respuesta actual:** `{"error":"Ruta no encontrada"}`

### 2. Verificar que la ruta está incluida en el build
```bash
# En el servidor de producción
cat .next/routes-manifest.json | grep products
```

### 3. Verificar conectividad a la base de datos
```bash
# En el servidor de producción
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.product.count().then(count => console.log('Productos:', count)).finally(() => process.exit())"
```

## Commit y Push Realizados

✅ Commit: `f9c69b9` - "Fix: Mejorar manejo de errores en /catalogo y API de productos"
✅ Push a GitHub: https://github.com/qhosting/cuenty-mvp

## Próximos Pasos

1. **Inmediato:** Verificar la configuración del servidor de producción
2. **Hacer pull de los cambios:** `git pull origin main`
3. **Re-construir:** `npm run build`
4. **Reiniciar el servidor:** `pm2 restart` o comando equivalente
5. **Verificar logs:** Buscar los mensajes `[API]` en los logs
6. **Probar:** Visitar https://cuenty.top/catalogo

## Recursos Adicionales

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)
- [Prisma Client Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

## Contacto para Soporte

Si el problema persiste después de seguir estas instrucciones, compartir:
1. Logs del servidor (últimas 50 líneas)
2. Resultado de `curl https://cuenty.top/api/products`
3. Configuración de Nginx/Apache (si aplica)
4. Variables de entorno (ocultar valores sensibles)
