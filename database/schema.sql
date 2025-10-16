
-- ============================================================================
-- CUENTY - Sistema de Gestión de Cuentas de Streaming
-- Esquema de Base de Datos PostgreSQL
-- ============================================================================

-- Limpieza de tablas existentes (para desarrollo)
DROP TABLE IF EXISTS ticket_mensajes CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS ordenes CASCADE;
DROP TABLE IF EXISTS inventario_cuentas CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- ============================================================================
-- TABLA: admins
-- Descripción: Administradores del sistema
-- ============================================================================
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE admins IS 'Administradores del sistema CUENTY';

-- ============================================================================
-- TABLA: usuarios
-- Descripción: Almacena los usuarios del sistema identificados por su celular
-- ============================================================================
CREATE TABLE usuarios (
    celular VARCHAR(15) PRIMARY KEY,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE usuarios IS 'Usuarios del sistema CUENTY identificados por número de celular';

-- ============================================================================
-- TABLA: productos
-- Descripción: Catálogo de servicios de streaming disponibles para la venta
-- ============================================================================
CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    duracion_dias INTEGER NOT NULL DEFAULT 30,
    activo BOOLEAN DEFAULT true
);

COMMENT ON TABLE productos IS 'Catálogo de productos/servicios de streaming disponibles';

-- ============================================================================
-- TABLA: inventario_cuentas
-- Descripción: Inventario de cuentas de streaming con credenciales encriptadas
-- ============================================================================
CREATE TABLE inventario_cuentas (
    id_cuenta SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto),
    correo_encriptado TEXT NOT NULL,
    contrasena_encriptada TEXT NOT NULL,
    perfil VARCHAR(10),
    pin VARCHAR(10),
    estado VARCHAR(20) CHECK (estado IN ('disponible','asignada','mantenimiento')) DEFAULT 'disponible',
    fecha_agregado TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE inventario_cuentas IS 'Inventario de cuentas de streaming con credenciales encriptadas';

-- ============================================================================
-- TABLA: ordenes
-- Descripción: Registro de órdenes de compra de servicios
-- ============================================================================
CREATE TABLE ordenes (
    id_orden SERIAL PRIMARY KEY,
    celular_usuario VARCHAR(15) NOT NULL REFERENCES usuarios(celular),
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto),
    id_cuenta_asignada INTEGER REFERENCES inventario_cuentas(id_cuenta),
    monto_pagado DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('pendiente_pago','pagada','expirada')) DEFAULT 'pendiente_pago',
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_vencimiento_servicio TIMESTAMP,
    datos_pago_spei JSONB
);

COMMENT ON TABLE ordenes IS 'Registro de órdenes de compra de servicios de streaming';

-- ============================================================================
-- TABLA: tickets
-- Descripción: Sistema de tickets para soporte al cliente
-- ============================================================================
CREATE TABLE tickets (
    id_ticket SERIAL PRIMARY KEY,
    celular_usuario VARCHAR(15) NOT NULL REFERENCES usuarios(celular),
    titulo_problema TEXT NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('abierto','en_proceso','resuelto','cerrado')) DEFAULT 'abierto',
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_ultima_actualizacion TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE tickets IS 'Sistema de tickets para soporte al cliente';

-- ============================================================================
-- TABLA: ticket_mensajes
-- Descripción: Mensajes de conversación dentro de cada ticket
-- ============================================================================
CREATE TABLE ticket_mensajes (
    id_mensaje SERIAL PRIMARY KEY,
    id_ticket INTEGER NOT NULL REFERENCES tickets(id_ticket) ON DELETE CASCADE,
    remitente VARCHAR(10) CHECK (remitente IN ('usuario','agente')) NOT NULL,
    cuerpo_mensaje TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE ticket_mensajes IS 'Mensajes de conversación dentro de cada ticket de soporte';

-- ============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- ============================================================================

CREATE INDEX idx_ordenes_celular ON ordenes(celular_usuario);
CREATE INDEX idx_ordenes_estado ON ordenes(estado);
CREATE INDEX idx_ordenes_fecha_creacion ON ordenes(fecha_creacion DESC);
CREATE INDEX idx_inventario_producto_estado ON inventario_cuentas(id_producto, estado);
CREATE INDEX idx_inventario_estado ON inventario_cuentas(estado);
CREATE INDEX idx_tickets_celular ON tickets(celular_usuario);
CREATE INDEX idx_tickets_estado ON tickets(estado);
CREATE INDEX idx_tickets_fecha ON tickets(fecha_creacion DESC);
CREATE INDEX idx_ticket_mensajes_ticket ON ticket_mensajes(id_ticket);
CREATE INDEX idx_ticket_mensajes_timestamp ON ticket_mensajes(timestamp DESC);

-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION actualizar_fecha_ticket()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tickets 
    SET fecha_ultima_actualizacion = NOW()
    WHERE id_ticket = NEW.id_ticket;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_fecha_ticket
AFTER INSERT ON ticket_mensajes
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_ticket();

-- ============================================================================
-- DATOS DE EJEMPLO
-- ============================================================================

INSERT INTO productos (nombre_servicio, descripcion, precio, duracion_dias, activo) VALUES
('Netflix 1 Pantalla', 'Acceso a Netflix con 1 pantalla simultánea. Contenido en HD.', 45.00, 30, true),
('Disney+ Premium', 'Todo el contenido de Disney, Pixar, Marvel, Star Wars y National Geographic.', 50.00, 30, true),
('HBO Max', 'HBO Max completo. Todo el catálogo de HBO, Warner Bros y Max Originals.', 55.00, 30, true),
('Prime Video', 'Amazon Prime Video. Catálogo completo de películas y series.', 40.00, 30, true),
('Spotify Premium', 'Spotify Premium Individual. Música sin anuncios y descarga offline.', 60.00, 30, true),
('YouTube Premium', 'YouTube sin anuncios, reproducción en segundo plano y YouTube Music.', 55.00, 30, true),
('Crunchyroll Premium', 'Anime sin anuncios en alta definición.', 45.00, 30, true),
('Apple TV+', 'Acceso a todo el contenido original de Apple TV+.', 50.00, 30, true);

-- Admin por defecto (username: admin, password: admin123)
-- IMPORTANTE: Cambiar en producción
INSERT INTO admins (username, password, email) VALUES
('admin', '$2a$10$YourHashedPasswordHere', 'admin@cuenty.com');

-- Mensaje de bienvenida
SELECT 'Base de datos inicializada correctamente' AS mensaje;
