
-- ============================================================================
-- CUENTY - Sistema de Gestión de Cuentas de Streaming
-- Esquema de Base de Datos PostgreSQL - E-COMMERCE ENHANCED
-- ============================================================================

-- Limpieza de tablas existentes (para desarrollo)
DROP TABLE IF EXISTS ticket_mensajes CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS shopping_cart CASCADE;
DROP TABLE IF EXISTS ordenes CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS inventario_cuentas CASCADE;
DROP TABLE IF EXISTS service_plans CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS phone_verifications CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS payment_instructions CASCADE;

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
    nombre VARCHAR(100),
    email VARCHAR(100),
    verificado BOOLEAN DEFAULT false,
    metodo_entrega_preferido VARCHAR(20) CHECK (metodo_entrega_preferido IN ('whatsapp','email','website')) DEFAULT 'whatsapp',
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    ultimo_acceso TIMESTAMP
);

COMMENT ON TABLE usuarios IS 'Usuarios del sistema CUENTY identificados por número de celular';

-- ============================================================================
-- TABLA: phone_verifications
-- Descripción: Códigos de verificación telefónica para registro
-- ============================================================================
CREATE TABLE phone_verifications (
    id SERIAL PRIMARY KEY,
    celular VARCHAR(15) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    expiracion TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT false,
    intentos INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_phone_verifications_celular ON phone_verifications(celular);
CREATE INDEX idx_phone_verifications_codigo ON phone_verifications(codigo);

COMMENT ON TABLE phone_verifications IS 'Códigos de verificación telefónica para registro y autenticación';

-- ============================================================================
-- TABLA: servicios
-- Descripción: Servicios de streaming disponibles (Netflix, Disney+, etc.)
-- ============================================================================
CREATE TABLE servicios (
    id_servicio SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    logo_url TEXT,
    categoria VARCHAR(50) DEFAULT 'streaming',
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE servicios IS 'Servicios de streaming disponibles';

-- ============================================================================
-- TABLA: service_plans
-- Descripción: Planes de cada servicio con duración y precios
-- ============================================================================
CREATE TABLE service_plans (
    id_plan SERIAL PRIMARY KEY,
    id_servicio INTEGER NOT NULL REFERENCES servicios(id_servicio) ON DELETE CASCADE,
    nombre_plan VARCHAR(100) NOT NULL,
    duracion_meses INTEGER NOT NULL,
    duracion_dias INTEGER GENERATED ALWAYS AS (duracion_meses * 30) STORED,
    costo DECIMAL(10,2) NOT NULL,
    margen_ganancia DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_venta DECIMAL(10,2) GENERATED ALWAYS AS (costo + margen_ganancia) STORED,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    UNIQUE(id_servicio, duracion_meses)
);

CREATE INDEX idx_service_plans_servicio ON service_plans(id_servicio);
CREATE INDEX idx_service_plans_activo ON service_plans(activo);

COMMENT ON TABLE service_plans IS 'Planes de suscripción para cada servicio con precios y duración';

-- Backward compatibility: Keep productos as a view
CREATE OR REPLACE VIEW productos AS
SELECT 
    id_plan as id_producto,
    CONCAT(s.nombre, ' - ', sp.nombre_plan) as nombre_servicio,
    sp.descripcion,
    sp.precio_venta as precio,
    sp.duracion_dias,
    sp.activo
FROM service_plans sp
JOIN servicios s ON sp.id_servicio = s.id_servicio;

-- ============================================================================
-- TABLA: inventario_cuentas
-- Descripción: Inventario de cuentas de streaming con credenciales encriptadas
-- ============================================================================
CREATE TABLE inventario_cuentas (
    id_cuenta SERIAL PRIMARY KEY,
    id_plan INTEGER NOT NULL REFERENCES service_plans(id_plan),
    correo_encriptado TEXT NOT NULL,
    contrasena_encriptada TEXT NOT NULL,
    perfil VARCHAR(50),
    pin VARCHAR(10),
    notas TEXT,
    estado VARCHAR(20) CHECK (estado IN ('disponible','asignada','mantenimiento','bloqueada')) DEFAULT 'disponible',
    fecha_agregado TIMESTAMP DEFAULT NOW(),
    fecha_ultima_asignacion TIMESTAMP
);

CREATE INDEX idx_inventario_plan_estado ON inventario_cuentas(id_plan, estado);

COMMENT ON TABLE inventario_cuentas IS 'Inventario de cuentas de streaming con credenciales encriptadas';

-- ============================================================================
-- TABLA: shopping_cart
-- Descripción: Carrito de compras de usuarios
-- ============================================================================
CREATE TABLE shopping_cart (
    id_cart_item SERIAL PRIMARY KEY,
    celular_usuario VARCHAR(15) NOT NULL REFERENCES usuarios(celular) ON DELETE CASCADE,
    id_plan INTEGER NOT NULL REFERENCES service_plans(id_plan),
    cantidad INTEGER DEFAULT 1 CHECK (cantidad > 0),
    fecha_agregado TIMESTAMP DEFAULT NOW(),
    UNIQUE(celular_usuario, id_plan)
);

CREATE INDEX idx_shopping_cart_usuario ON shopping_cart(celular_usuario);

COMMENT ON TABLE shopping_cart IS 'Carrito de compras de usuarios';

-- ============================================================================
-- TABLA: ordenes
-- Descripción: Registro de órdenes de compra de servicios
-- ============================================================================
CREATE TABLE ordenes (
    id_orden SERIAL PRIMARY KEY,
    celular_usuario VARCHAR(15) NOT NULL REFERENCES usuarios(celular),
    monto_total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(30) CHECK (estado IN ('pendiente','pendiente_pago','pagada','en_proceso','entregada','cancelada')) DEFAULT 'pendiente_pago',
    metodo_pago VARCHAR(50) DEFAULT 'transferencia_bancaria',
    metodo_entrega VARCHAR(20) CHECK (metodo_entrega IN ('whatsapp','email','website')) DEFAULT 'whatsapp',
    instrucciones_pago TEXT,
    notas_admin TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_pago TIMESTAMP,
    fecha_entrega TIMESTAMP,
    datos_pago JSONB
);

CREATE INDEX idx_ordenes_usuario ON ordenes(celular_usuario);
CREATE INDEX idx_ordenes_estado ON ordenes(estado);
CREATE INDEX idx_ordenes_fecha ON ordenes(fecha_creacion DESC);

COMMENT ON TABLE ordenes IS 'Registro de órdenes de compra de servicios de streaming';

-- ============================================================================
-- TABLA: order_items
-- Descripción: Items individuales de cada orden
-- ============================================================================
CREATE TABLE order_items (
    id_order_item SERIAL PRIMARY KEY,
    id_orden INTEGER NOT NULL REFERENCES ordenes(id_orden) ON DELETE CASCADE,
    id_plan INTEGER NOT NULL REFERENCES service_plans(id_plan),
    id_cuenta_asignada INTEGER REFERENCES inventario_cuentas(id_cuenta),
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    estado VARCHAR(30) CHECK (estado IN ('pendiente','asignada','entregada')) DEFAULT 'pendiente',
    fecha_vencimiento_servicio TIMESTAMP,
    credenciales_entregadas BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_orden ON order_items(id_orden);
CREATE INDEX idx_order_items_plan ON order_items(id_plan);

COMMENT ON TABLE order_items IS 'Items individuales de cada orden con sus credenciales asignadas';

-- ============================================================================
-- TABLA: payment_instructions
-- Descripción: Instrucciones de pago bancario configurables
-- ============================================================================
CREATE TABLE payment_instructions (
    id SERIAL PRIMARY KEY,
    banco VARCHAR(100) NOT NULL,
    titular VARCHAR(200) NOT NULL,
    numero_cuenta VARCHAR(50),
    clabe VARCHAR(18),
    concepto_referencia TEXT,
    instrucciones_adicionales TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE payment_instructions IS 'Instrucciones de pago bancario para transferencias';

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
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================================================

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

-- Insertar servicios de streaming
INSERT INTO servicios (nombre, descripcion, categoria, activo) VALUES
('Netflix', 'Plataforma líder de streaming con contenido original y licenciado', 'streaming', true),
('Disney+', 'Todo el contenido de Disney, Pixar, Marvel, Star Wars y National Geographic', 'streaming', true),
('HBO Max', 'HBO Max completo con todo el catálogo de HBO, Warner Bros y Max Originals', 'streaming', true),
('Prime Video', 'Amazon Prime Video con catálogo completo de películas y series', 'streaming', true),
('Spotify', 'Música sin anuncios y descarga offline', 'musica', true);

-- Insertar planes para cada servicio (1, 3, 6, 12 meses)
-- Netflix
INSERT INTO service_plans (id_servicio, nombre_plan, duracion_meses, costo, margen_ganancia, descripcion, activo) VALUES
(1, '1 Mes', 1, 120.00, 30.00, 'Netflix Premium - 1 pantalla HD', true),
(1, '3 Meses', 3, 340.00, 80.00, 'Netflix Premium - 1 pantalla HD', true),
(1, '6 Meses', 6, 650.00, 150.00, 'Netflix Premium - 1 pantalla HD', true),
(1, '1 Año', 12, 1200.00, 300.00, 'Netflix Premium - 1 pantalla HD', true);

-- Disney+
INSERT INTO service_plans (id_servicio, nombre_plan, duracion_meses, costo, margen_ganancia, descripcion, activo) VALUES
(2, '1 Mes', 1, 130.00, 30.00, 'Disney+ Premium completo', true),
(2, '3 Meses', 3, 370.00, 80.00, 'Disney+ Premium completo', true),
(2, '6 Meses', 6, 720.00, 150.00, 'Disney+ Premium completo', true),
(2, '1 Año', 12, 1400.00, 300.00, 'Disney+ Premium completo', true);

-- HBO Max
INSERT INTO service_plans (id_servicio, nombre_plan, duracion_meses, costo, margen_ganancia, descripcion, activo) VALUES
(3, '1 Mes', 1, 140.00, 35.00, 'HBO Max completo', true),
(3, '3 Meses', 3, 400.00, 95.00, 'HBO Max completo', true),
(3, '6 Meses', 6, 780.00, 180.00, 'HBO Max completo', true),
(3, '1 Año', 12, 1500.00, 350.00, 'HBO Max completo', true);

-- Prime Video
INSERT INTO service_plans (id_servicio, nombre_plan, duracion_meses, costo, margen_ganancia, descripcion, activo) VALUES
(4, '1 Mes', 1, 100.00, 25.00, 'Amazon Prime Video completo', true),
(4, '3 Meses', 3, 280.00, 70.00, 'Amazon Prime Video completo', true),
(4, '6 Meses', 6, 540.00, 130.00, 'Amazon Prime Video completo', true),
(4, '1 Año', 12, 1000.00, 250.00, 'Amazon Prime Video completo', true);

-- Spotify
INSERT INTO service_plans (id_servicio, nombre_plan, duracion_meses, costo, margen_ganancia, descripcion, activo) VALUES
(5, '1 Mes', 1, 150.00, 35.00, 'Spotify Premium Individual', true),
(5, '3 Meses', 3, 430.00, 95.00, 'Spotify Premium Individual', true),
(5, '6 Meses', 6, 840.00, 180.00, 'Spotify Premium Individual', true),
(5, '1 Año', 12, 1600.00, 350.00, 'Spotify Premium Individual', true);

-- Instrucciones de pago por defecto
INSERT INTO payment_instructions (banco, titular, numero_cuenta, clabe, concepto_referencia, instrucciones_adicionales, activo) VALUES
('BBVA Bancomer', 'CUENTY DIGITAL S.A. DE C.V.', '0123456789', '012345678901234567', 'Orden #{{orden_id}}', 
'1. Realiza la transferencia por el monto exacto\n2. Incluye el número de orden en el concepto\n3. Envía tu comprobante por WhatsApp al número de contacto\n4. Recibirás tus credenciales en menos de 2 horas', true);

-- Admin por defecto (username: admin, email: admin@cuenty.com, password: Admin123!)
-- IMPORTANTE: Cambiar en producción
INSERT INTO admins (username, password, email) VALUES
('admin', '$2a$10$.qHC00LExwdCytfPF3qGueIsrB1.FF474XmBQ/C4Q1MzHlGUdKO6i', 'admin@cuenty.com');

-- Mensaje de bienvenida
SELECT 'Base de datos inicializada correctamente con ' || COUNT(*) || ' planes de servicios' AS mensaje
FROM service_plans;
