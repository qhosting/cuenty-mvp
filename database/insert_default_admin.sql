-- ============================================================================
-- CUENTY - Insertar Administrador por Defecto
-- ============================================================================
-- Este script inserta un usuario administrador por defecto en el sistema
--
-- Credenciales:
--   Email: admin@cuenty.com
--   Password: Admin123!
--
-- IMPORTANTE: 
--   - Este script es solo para desarrollo/testing inicial
--   - En producción, cambiar inmediatamente estas credenciales por seguridad
--   - Ejecutar este script solo si no existe el usuario administrador
-- ============================================================================

-- Primero verificar si la tabla admins existe, si no crearla
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Eliminar admin por defecto si existe (para re-creación)
DELETE FROM admins WHERE email = 'admin@cuenty.com';

-- Insertar administrador por defecto
-- Password: Admin123! (hash bcrypt)
INSERT INTO admins (username, password, email) 
VALUES (
    'admin',
    '$2a$10$.qHC00LExwdCytfPF3qGueIsrB1.FF474XmBQ/C4Q1MzHlGUdKO6i',
    'admin@cuenty.com'
)
ON CONFLICT (username) 
DO UPDATE SET 
    password = '$2a$10$.qHC00LExwdCytfPF3qGueIsrB1.FF474XmBQ/C4Q1MzHlGUdKO6i',
    email = 'admin@cuenty.com';

-- Verificar la inserción
SELECT 
    id,
    username,
    email,
    fecha_creacion,
    '✓ Administrador creado correctamente' as status
FROM admins 
WHERE email = 'admin@cuenty.com';

-- ============================================================================
-- RESULTADO
-- ============================================================================
-- Si ve una fila con el status "✓ Administrador creado correctamente",
-- el usuario admin ha sido creado exitosamente.
--
-- Para iniciar sesión:
--   POST /api/admin/login
--   Body: { "username": "admin", "password": "Admin123!" }
-- ============================================================================
