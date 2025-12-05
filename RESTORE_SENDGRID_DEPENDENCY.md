# Guía para Restaurar Dependencia @sendgrid/mail

## 🚨 Estado Actual

La dependencia `@sendgrid/mail` ha sido **temporalmente removida** del proyecto debido a errores de integridad de checksums durante el build de Docker.

### Error Específico:
```
npm error code EINTEGRITY
integrity checksum failed when using sha512: wanted sha512-Ze7WuW2Xzy5GT5WRx+yEv89fsg/pgy3T1E3FSuf80D+oDQpF6p6080Knpnti4tsBAP37jAJg/00d3v1eK0hKtw== but got sha512-Ze7WuW2Xzy5GT5WRx+yEv89fsg/pgy3T1E3FSuf80D+oDQpF6p6080Knpnti4tsBAP37jAJg/00d3v1eK0hKtw==. (27080 bytes)
```

## ✅ Solución Temporal

- **package.json**: `@sendgrid/mail` removido temporalmente
- **package-lock.json**: Restaurado a estado sin checksums problemáticos
- **Docker build**: Ahora debería funcionar correctamente

## 🔄 Cómo Restaurar la Dependencia Correctamente

### Paso 1: Regenerar package-lock.json
```bash
cd backend
npm install @sendgrid/mail@8.1.0
```

Este comando va a:
- Agregar `@sendgrid/mail@8.1.0` al `package.json`
- Generar un `package-lock.json` fresco con checksums correctos
- Instalar todas las dependencias sin errores

### Paso 2: Verificar la Instalación
```bash
npm ci --only=production
```

### Paso 3: Commit y Push
```bash
git add backend/package.json backend/package-lock.json
git commit -m "feat: restore @sendgrid/mail dependency with correct checksums

- Added @sendgrid/mail@8.1.0 for email automation features
- Regenerated package-lock.json with valid integrity checksums
- Resolves npm EINTEGRITY errors during Docker builds"

git push origin main
```

## 📝 Servicios que Requieren @sendgrid/mail

Una vez restaurada, estos servicios funcionarán completamente:

### 1. EmailService (`services/emailService.js`)
- Envío de notificaciones de renovación
- Emails de confirmación de suscripción
- Alertas de vencimiento de cuentas

### 2. RenewalService (`services/renewalService.js`)
- Procesamiento automático de renovaciones
- Notificaciones de renovación vencida

### 3. AutoAssignmentService (`services/autoAssignmentService.js`)
- Notificaciones por email cuando se asignan cuentas

## 🚀 Variables de Entorno Requeridas

Una vez que restaures la dependencia, asegúrate de configurar:

```env
# Email service
ENABLE_EMAIL_SERVICE=true
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

## ⚠️ Notas Importantes

1. **NO editar manualmente** el `package-lock.json` con checksums inventados
2. **Siempre usar** `npm install` para generar el lock file correctamente
3. **Verificar** que `npm ci` funcione antes de hacer commit
4. **Si el problema persiste**, verificar conectividad con npm registry

## 🔧 Troubleshooting

Si aún hay problemas después de restaurar:

```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y lock file
rm -rf node_modules package-lock.json

# Reinstalar dependencias
npm install
```

---

**Fecha de Remoción**: 2025-12-05  
**Commit**: revert: temporarily remove @sendgrid/mail dependency  
**Estado**: Ready to restore when npm registry integrity is fixed