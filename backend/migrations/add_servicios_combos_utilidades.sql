-- Migración: Sistema de Servicios con Tipos, Combos y Utilidades
-- Fecha: 2025-10-24
-- Descripción: Agregar soporte para tipos de planes, combos y cálculo de utilidades

-- 1. Crear enum para tipos de plan
DO $$ BEGIN
    CREATE TYPE "TipoPlan" AS ENUM ('INDIVIDUAL', 'COMPLETA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Agregar campos nuevos a service_plans
ALTER TABLE service_plans 
ADD COLUMN IF NOT EXISTS tipo_plan "TipoPlan" DEFAULT 'INDIVIDUAL',
ADD COLUMN IF NOT EXISTS duracion_dias INT DEFAULT 30;

-- Actualizar unique constraint para incluir tipo_plan
ALTER TABLE service_plans DROP CONSTRAINT IF EXISTS service_plans_id_servicio_duracion_meses_key;
ALTER TABLE service_plans 
ADD CONSTRAINT service_plans_id_servicio_duracion_meses_tipo_plan_key 
UNIQUE (id_servicio, duracion_meses, tipo_plan);

-- Crear índice para tipo_plan
CREATE INDEX IF NOT EXISTS idx_service_plans_tipo ON service_plans(tipo_plan);

-- 3. Agregar campos de utilidad a ordenes
ALTER TABLE ordenes 
ADD COLUMN IF NOT EXISTS utilidad_total DECIMAL(10, 2);

-- 4. Agregar campos de costo y utilidad a order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS costo_unitario DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS utilidad DECIMAL(10, 2);

-- 5. Crear tabla de combos
CREATE TABLE IF NOT EXISTS combos (
    id_combo SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_total DECIMAL(10, 2) NOT NULL,
    costo_total DECIMAL(10, 2) NOT NULL,
    imagen_url TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para combos activos
CREATE INDEX IF NOT EXISTS idx_combos_activo ON combos(activo);

-- 6. Crear tabla de items de combos (relación many-to-many)
CREATE TABLE IF NOT EXISTS combo_items (
    id_combo_item SERIAL PRIMARY KEY,
    id_combo INT NOT NULL,
    id_plan INT NOT NULL,
    cantidad INT DEFAULT 1,
    FOREIGN KEY (id_combo) REFERENCES combos(id_combo) ON DELETE CASCADE,
    FOREIGN KEY (id_plan) REFERENCES service_plans(id_plan),
    UNIQUE(id_combo, id_plan)
);

-- Crear índices para combo_items
CREATE INDEX IF NOT EXISTS idx_combo_items_combo ON combo_items(id_combo);
CREATE INDEX IF NOT EXISTS idx_combo_items_plan ON combo_items(id_plan);

-- 7. Insertar configuración de pago inicial (datos de ARCUS)
INSERT INTO payment_instructions (banco, titular, clabe, concepto_referencia, activo)
VALUES (
    'ARCUS',
    'Edwin Zapote Salinas',
    '706969302088677417',
    'SPEI',
    true
)
ON CONFLICT DO NOTHING;

-- 8. Comentarios para documentación
COMMENT ON TABLE combos IS 'Tabla de combos de servicios (paquetes de planes)';
COMMENT ON TABLE combo_items IS 'Items individuales que componen cada combo';
COMMENT ON COLUMN service_plans.tipo_plan IS 'Tipo de plan: INDIVIDUAL (1 perfil) o COMPLETA (cuenta completa)';
COMMENT ON COLUMN service_plans.duracion_dias IS 'Duración en días del servicio (30 días, 365 días para 12 meses)';
COMMENT ON COLUMN ordenes.utilidad_total IS 'Utilidad total de la orden (precio_venta - costo)';
COMMENT ON COLUMN order_items.costo_unitario IS 'Costo unitario del servicio para el negocio';
COMMENT ON COLUMN order_items.utilidad IS 'Utilidad del item (precio_unitario - costo_unitario) * cantidad';
