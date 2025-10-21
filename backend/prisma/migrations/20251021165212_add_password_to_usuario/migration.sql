-- AlterTable
-- Agregar campo password a la tabla usuarios
ALTER TABLE "usuarios" ADD COLUMN "password" VARCHAR(255);

-- Comentario: Este campo almacenará la contraseña hasheada con bcrypt para usuarios normales
-- Nota: El campo es nullable para mantener compatibilidad con usuarios existentes
