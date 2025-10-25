# Documento de Deuda Técnica - Proyecto CUENTY

Este documento enumera los problemas técnicos y riesgos identificados en el proyecto que deben ser abordados en el futuro para mejorar la estabilidad, seguridad y mantenibilidad del sistema.

---

### 1. Ausencia Total de Pruebas Automatizadas

*   **Criticidad**: Alta
*   **Descripción**: El proyecto carece por completo de una suite de pruebas automatizadas (unitarias, de integración o de extremo a extremo) tanto en el `backend` como en el `frontend` (`nextjs_space`). El comando `npm test` existe pero no ejecuta ninguna prueba.
*   **Impacto**:
    *   **Alto Riesgo de Regresiones**: Cualquier cambio en el código puede introducir errores en funcionalidades existentes sin que el equipo de desarrollo se dé cuenta.
    *   **Dificultad para Refactorizar**: Es arriesgado y lento mejorar o cambiar el código existente porque no hay una red de seguridad que garantice que los cambios no rompen nada.
    *   **Desarrollo Lento**: La falta de pruebas obliga a realizar verificaciones manuales extensas y repetitivas, lo que ralentiza el ciclo de desarrollo.
*   **Acción Recomendada**:
    *   Implementar un framework de pruebas como **Jest** junto con **Testing Library** para el frontend de Next.js.
    *   Implementar **Jest** y **Supertest** para las pruebas de la API del backend.
    *   Empezar por añadir pruebas a los flujos más críticos, como la autenticación, la creación de pedidos y la gestión de servicios.
    *   Establecer un objetivo de cobertura de código (ej. 70%) para las nuevas funcionalidades.

### 2. Cifrado Débil de Credenciales en la Base de Datos

*   **Criticidad**: Alta
*   **Descripción**: Las credenciales de las cuentas de streaming (`correo` y `contraseña`) se "cifran" utilizando codificación `base64` antes de ser guardadas en la base de datos. **Base64 no es un algoritmo de cifrado**, sino de codificación, y puede ser revertido trivialmente por cualquiera.
*   **Impacto**: Si un atacante obtiene acceso a la base de datos (por ejemplo, a través de una inyección SQL o un volcado de la base de datos), podrá leer todas las credenciales de las cuentas de streaming de los clientes en texto plano.
*   **Archivos Afectados**: `nextjs_space/app/api/admin/accounts/route.ts` y `[id]/route.ts`.
*   **Acción Recomendada**:
    *   Reemplazar la codificación `base64` por un algoritmo de cifrado simétrico robusto como **AES-256-GCM**.
    *   La clave de cifrado (`ENCRYPTION_KEY`) debe ser una cadena aleatoria segura de 32 bytes y debe ser gestionada exclusivamente a través de variables de entorno, nunca codificada en el código.
    *   Crear un script de migración para volver a cifrar todas las credenciales existentes en la base de datos con el nuevo algoritmo.

### 3. Vulnerabilidades en Dependencias del Backend

*   **Criticidad**: Moderada
*   **Descripción**: `npm audit` detectó dos vulnerabilidades de severidad moderada en el paquete `validator.js` (una dependencia de `express-validator`).
*   **Impacto**: Estas vulnerabilidades específicas podrían permitir que un atacante evada ciertas validaciones de URL, lo que podría llevar a ataques de SSRF (Server-Side Request Forgery) si la aplicación utiliza estas validaciones para hacer peticiones a URLs externas.
*   **Acción Recomendada**:
    *   Investigar las vulnerabilidades reportadas para entender el impacto real en el contexto de esta aplicación.
    *   Dado que no hay una solución automática, se debe explorar la posibilidad de actualizar `express-validator` a una nueva versión mayor que utilice una versión parcheada de `validator.js`. Esto puede requerir cambios en el código que utiliza `express-validator`.
    *   Si la actualización no es posible, se podría considerar reemplazar `validator.js` o implementar validaciones personalizadas para las URLs críticas.

### 4. Construcción de Docker Bloqueada por Límites de Tasa

*   **Criticidad**: Baja (para el código), Alta (para el entorno de desarrollo/CI)
*   **Descripción**: La construcción de la imagen de Docker falla frecuentemente debido a que se alcanza el límite de descargas de imágenes de Docker Hub para usuarios no autenticados.
*   **Impacto**: Dificulta la incorporación de nuevos desarrolladores al proyecto y puede causar fallos en los pipelines de integración y despliegue continuo (CI/CD).
*   **Acción Recomendada**:
    *   Para desarrolladores locales: Documentar la necesidad de autenticarse en Docker Hub (`docker login`) antes de ejecutar `docker compose up`.
    *   Para entornos de CI/CD: Configurar secretos en el sistema de CI (como GitHub Actions Secrets) para almacenar credenciales de Docker Hub y usarlas para autenticarse durante el proceso de construcción.
    *   Alternativa a largo plazo: Considerar alojar las imágenes base en un registro de contenedores privado (como AWS ECR, Google Artifact Registry o GitHub Container Registry) para evitar depender de los límites de tasa de Docker Hub.
