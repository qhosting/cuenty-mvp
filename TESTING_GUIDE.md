# 🧪 Guía de Pruebas - Admin/Services

## 🚀 Inicio Rápido

### 1. Iniciar el Servidor
```bash
cd /home/ubuntu/cuenty_mvp/nextjs_space
npm run dev
```

### 2. Acceder al Panel de Admin
- URL: `http://localhost:3001/admin/login`
- Credenciales: (usar las configuradas en tu `.env`)

### 3. Navegar a Servicios
- Click en "Servicios" en el menú lateral
- O acceder directamente: `http://localhost:3001/admin/services`

---

## ✅ Casos de Prueba

### Test 1: Crear Servicio con Logo Predefinido
**Objetivo**: Verificar que se puede crear un servicio usando un logo predefinido

**Pasos**:
1. Click en "Nuevo Servicio"
2. Llenar el formulario:
   - Nombre: "Apple TV+"
   - Descripción: "Streaming de series y películas originales de Apple"
3. En la sección de logo:
   - Asegurar que está en la pestaña "Predefinidos"
   - Seleccionar el logo de "Apple TV+"
4. Dejar "Servicio activo" marcado
5. Click en "Crear"

**Resultado Esperado**:
- ✅ Mensaje de éxito: "Servicio creado correctamente"
- ✅ El servicio aparece en la lista
- ✅ El logo se muestra correctamente

---

### Test 2: Crear Servicio con URL Personalizada
**Objetivo**: Verificar que se puede crear un servicio con una URL de logo personalizada

**Pasos**:
1. Click en "Nuevo Servicio"
2. Llenar el formulario:
   - Nombre: "Canva Pro"
   - Descripción: "Herramienta de diseño gráfico profesional"
3. En la sección de logo:
   - Click en la pestaña "URL"
   - Pegar: `https://i.pinimg.com/474x/6c/d7/20/6cd7205407c8d4a5a7c4d5edad97cda5.jpg`
   - Click en "Aplicar"
4. Verificar que aparece la vista previa
5. Click en "Crear"

**Resultado Esperado**:
- ✅ Mensaje de éxito
- ✅ El logo personalizado se muestra correctamente
- ✅ La vista previa funciona

---

### Test 3: Crear Servicio sin Logo
**Objetivo**: Verificar que se puede crear un servicio sin logo

**Pasos**:
1. Click en "Nuevo Servicio"
2. Llenar el formulario:
   - Nombre: "Servicio de Prueba"
   - Descripción: "Servicio sin logo para testing"
3. NO seleccionar ningún logo
4. Click en "Crear"

**Resultado Esperado**:
- ✅ El servicio se crea exitosamente
- ✅ Muestra un ícono placeholder en lugar de logo

---

### Test 4: Validación de Nombre Duplicado
**Objetivo**: Verificar que el sistema previene duplicados

**Pasos**:
1. Intenta crear un servicio con un nombre que ya existe (ej: "Netflix" si ya existe)
2. Click en "Crear"

**Resultado Esperado**:
- ❌ Error claro: "Ya existe un servicio con ese nombre"
- ❌ El servicio NO se crea

---

### Test 5: Validación de Campos Requeridos
**Objetivo**: Verificar validaciones de formulario

**Pasos**:
1. Click en "Nuevo Servicio"
2. Dejar nombre vacío
3. Click en "Crear"

**Resultado Esperado**:
- ❌ Error: "Nombre del servicio es requerido"

**Pasos adicionales**:
1. Ingresar nombre con menos de 3 caracteres: "AB"
2. Click en "Crear"

**Resultado Esperado**:
- ❌ Error: "Nombre debe tener al menos 3 caracteres"

---

### Test 6: Editar Servicio Existente
**Objetivo**: Verificar que se puede editar un servicio

**Pasos**:
1. Hover sobre una tarjeta de servicio
2. Click en el ícono de editar (✏️)
3. Cambiar la descripción
4. Cambiar el logo (seleccionar otro de predefinidos)
5. Click en "Actualizar"

**Resultado Esperado**:
- ✅ Mensaje: "Servicio actualizado correctamente"
- ✅ Los cambios se reflejan inmediatamente

---

### Test 7: Activar/Desactivar Servicio
**Objetivo**: Verificar el toggle de estado

**Pasos**:
1. Hover sobre un servicio activo
2. Click en el ícono de ojo (👁️)
3. Observar el cambio de estado

**Resultado Esperado**:
- ✅ El estado cambia de "Activo" a "Inactivo" (o viceversa)
- ✅ El color del badge cambia (verde ↔️ rojo)
- ✅ Mensaje de confirmación

---

### Test 8: Intentar Subir Archivo (Sin S3)
**Objetivo**: Verificar el manejo cuando S3 no está configurado

**Pasos**:
1. Click en "Nuevo Servicio"
2. En la sección de logo, click en la pestaña "Subir"

**Resultado Esperado**:
- ⚠️ Mensaje de advertencia: "La subida de archivos no está disponible"
- ⚠️ Sugerencia de usar logos predefinidos o URL
- ✅ Las otras opciones siguen funcionando

---

### Test 9: Eliminar Servicio Sin Planes
**Objetivo**: Verificar que se puede eliminar un servicio sin dependencias

**Pasos**:
1. Crear un servicio de prueba (sin planes asociados)
2. Hover sobre el servicio
3. Click en el ícono de eliminar (🗑️)
4. Confirmar la eliminación

**Resultado Esperado**:
- ✅ Modal de confirmación aparece
- ✅ Al confirmar: "Servicio eliminado correctamente"
- ✅ El servicio desaparece de la lista

---

### Test 10: Intentar Eliminar Servicio con Planes
**Objetivo**: Verificar que no se puede eliminar un servicio con planes asociados

**Pasos**:
1. Intentar eliminar un servicio que tiene planes (ej: Netflix)
2. Confirmar la eliminación

**Resultado Esperado**:
- ❌ Error: "No se puede eliminar el servicio porque tiene planes asociados"
- ❌ El servicio NO se elimina
- ℹ️ Mensaje indica cuántos planes tiene

---

### Test 11: Búsqueda de Servicios
**Objetivo**: Verificar que la búsqueda funciona

**Pasos**:
1. En el campo de búsqueda, escribir "Net"
2. Observar los resultados

**Resultado Esperado**:
- ✅ Solo muestra servicios que coinciden con la búsqueda
- ✅ La búsqueda funciona en nombre y descripción
- ✅ Es case-insensitive

---

### Test 12: URL Inválida
**Objetivo**: Verificar validación de URLs

**Pasos**:
1. Click en "Nuevo Servicio"
2. Llenar nombre y descripción
3. En la pestaña "URL", ingresar: "esto-no-es-una-url"
4. Click en "Aplicar"

**Resultado Esperado**:
- ❌ Error: "URL no válida"
- ❌ No se aplica la URL

---

## 🔍 Verificaciones Adicionales

### Consola del Navegador
Abre las DevTools (F12) y verifica:
- ✅ No hay errores en la consola
- ✅ Las peticiones a `/api/admin/services` retornan 200 o 201
- ✅ Los toast notifications se muestran correctamente

### Logs del Servidor
En la terminal donde corre `npm run dev`, verifica:
```
[Admin Services POST] Servicio creado exitosamente: 123
[Admin Services PUT] Servicio actualizado exitosamente: 123
[Admin Services DELETE] Servicio eliminado exitosamente: 123
```

### Base de Datos
Verifica en la base de datos que:
- Los servicios se guardan correctamente
- Los logos se almacenan como URLs (no archivos binarios)
- El campo `activo` funciona correctamente

---

## 📊 Checklist de Testing

Marca cada test al completarlo:

- [ ] Test 1: Crear con logo predefinido
- [ ] Test 2: Crear con URL personalizada
- [ ] Test 3: Crear sin logo
- [ ] Test 4: Validación de duplicados
- [ ] Test 5: Validación de campos
- [ ] Test 6: Editar servicio
- [ ] Test 7: Activar/Desactivar
- [ ] Test 8: Intentar subir archivo
- [ ] Test 9: Eliminar servicio sin planes
- [ ] Test 10: Intentar eliminar con planes
- [ ] Test 11: Búsqueda
- [ ] Test 12: URL inválida

---

## 🐛 Reportar Problemas

Si encuentras algún problema durante las pruebas:

1. **Captura el error**:
   - Screenshot de la pantalla
   - Mensaje de error completo
   - Logs de la consola

2. **Anota los pasos**:
   - Qué estabas haciendo
   - Qué esperabas que sucediera
   - Qué sucedió en realidad

3. **Contexto adicional**:
   - Navegador y versión
   - Estado de la base de datos
   - Variables de entorno relevantes

---

## ✅ Criterios de Éxito

El testing es exitoso si:
- ✅ Todos los tests pasan sin errores
- ✅ Los mensajes de error son claros y útiles
- ✅ No hay errores en la consola del navegador
- ✅ La interfaz responde rápidamente
- ✅ Los datos persisten correctamente en la BD
- ✅ La experiencia de usuario es fluida

---

**Nota**: Recuerda que la funcionalidad de subida de archivos requiere configuración de AWS S3. El sistema está diseñado para funcionar perfectamente sin ella.
