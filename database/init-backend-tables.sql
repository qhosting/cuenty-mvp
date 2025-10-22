-- CreateEnum
CREATE TYPE "EstadoCuenta" AS ENUM ('disponible', 'asignada', 'mantenimiento', 'bloqueada');

-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('pendiente', 'pendiente_pago', 'pagada', 'en_proceso', 'entregada', 'cancelada');

-- CreateEnum
CREATE TYPE "EstadoOrderItem" AS ENUM ('pendiente', 'asignada', 'entregada');

-- CreateEnum
CREATE TYPE "EstadoTicket" AS ENUM ('abierto', 'en_proceso', 'resuelto', 'cerrado');

-- CreateEnum
CREATE TYPE "RemitenteTicket" AS ENUM ('usuario', 'agente');

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "celular" VARCHAR(15) NOT NULL,
    "nombre" VARCHAR(100),
    "email" VARCHAR(100),
    "password" VARCHAR(255),
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "metodo_entrega_preferido" VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_acceso" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("celular")
);

-- CreateTable
CREATE TABLE "phone_verifications" (
    "id" SERIAL NOT NULL,
    "celular" VARCHAR(15) NOT NULL,
    "codigo" VARCHAR(6) NOT NULL,
    "expiracion" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id_servicio" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "logo_url" TEXT,
    "categoria" VARCHAR(50) NOT NULL DEFAULT 'streaming',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "service_plans" (
    "id_plan" SERIAL NOT NULL,
    "id_servicio" INTEGER NOT NULL,
    "nombre_plan" VARCHAR(100) NOT NULL,
    "duracion_meses" INTEGER NOT NULL,
    "duracion_dias" INTEGER,
    "costo" DECIMAL(10,2) NOT NULL,
    "margen_ganancia" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "precio_venta" DECIMAL(10,2),
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_plans_pkey" PRIMARY KEY ("id_plan")
);

-- CreateTable
CREATE TABLE "inventario_cuentas" (
    "id_cuenta" SERIAL NOT NULL,
    "id_plan" INTEGER NOT NULL,
    "correo_encriptado" TEXT NOT NULL,
    "contrasena_encriptada" TEXT NOT NULL,
    "perfil" VARCHAR(50),
    "pin" VARCHAR(10),
    "notas" TEXT,
    "estado" "EstadoCuenta" NOT NULL DEFAULT 'disponible',
    "fecha_agregado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_ultima_asignacion" TIMESTAMP(3),

    CONSTRAINT "inventario_cuentas_pkey" PRIMARY KEY ("id_cuenta")
);

-- CreateTable
CREATE TABLE "shopping_cart" (
    "id_cart_item" SERIAL NOT NULL,
    "celular_usuario" VARCHAR(15) NOT NULL,
    "id_plan" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "fecha_agregado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shopping_cart_pkey" PRIMARY KEY ("id_cart_item")
);

-- CreateTable
CREATE TABLE "ordenes" (
    "id_orden" SERIAL NOT NULL,
    "celular_usuario" VARCHAR(15) NOT NULL,
    "monto_total" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoOrden" NOT NULL DEFAULT 'pendiente_pago',
    "metodo_pago" VARCHAR(50) NOT NULL DEFAULT 'transferencia_bancaria',
    "metodo_entrega" VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
    "instrucciones_pago" TEXT,
    "notas_admin" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_pago" TIMESTAMP(3),
    "fecha_entrega" TIMESTAMP(3),
    "datos_pago" JSONB,

    CONSTRAINT "ordenes_pkey" PRIMARY KEY ("id_orden")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id_order_item" SERIAL NOT NULL,
    "id_orden" INTEGER NOT NULL,
    "id_plan" INTEGER NOT NULL,
    "id_cuenta_asignada" INTEGER,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoOrderItem" NOT NULL DEFAULT 'pendiente',
    "fecha_vencimiento_servicio" TIMESTAMP(3),
    "credenciales_entregadas" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id_order_item")
);

-- CreateTable
CREATE TABLE "payment_instructions" (
    "id" SERIAL NOT NULL,
    "banco" VARCHAR(100) NOT NULL,
    "titular" VARCHAR(200) NOT NULL,
    "numero_cuenta" VARCHAR(50),
    "clabe" VARCHAR(18),
    "concepto_referencia" TEXT,
    "instrucciones_adicionales" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_instructions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id_ticket" SERIAL NOT NULL,
    "celular_usuario" VARCHAR(15) NOT NULL,
    "titulo_problema" TEXT NOT NULL,
    "estado" "EstadoTicket" NOT NULL DEFAULT 'abierto',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_ultima_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id_ticket")
);

-- CreateTable
CREATE TABLE "ticket_mensajes" (
    "id_mensaje" SERIAL NOT NULL,
    "id_ticket" INTEGER NOT NULL,
    "remitente" "RemitenteTicket" NOT NULL,
    "cuerpo_mensaje" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_mensajes_pkey" PRIMARY KEY ("id_mensaje")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE INDEX "idx_phone_verifications_celular" ON "phone_verifications"("celular");

-- CreateIndex
CREATE INDEX "idx_phone_verifications_codigo" ON "phone_verifications"("codigo");

-- CreateIndex
CREATE INDEX "idx_service_plans_servicio" ON "service_plans"("id_servicio");

-- CreateIndex
CREATE INDEX "idx_service_plans_activo" ON "service_plans"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "service_plans_id_servicio_duracion_meses_key" ON "service_plans"("id_servicio", "duracion_meses");

-- CreateIndex
CREATE INDEX "idx_inventario_plan_estado" ON "inventario_cuentas"("id_plan", "estado");

-- CreateIndex
CREATE INDEX "idx_shopping_cart_usuario" ON "shopping_cart"("celular_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "shopping_cart_celular_usuario_id_plan_key" ON "shopping_cart"("celular_usuario", "id_plan");

-- CreateIndex
CREATE INDEX "idx_ordenes_usuario" ON "ordenes"("celular_usuario");

-- CreateIndex
CREATE INDEX "idx_ordenes_estado" ON "ordenes"("estado");

-- CreateIndex
CREATE INDEX "idx_ordenes_fecha" ON "ordenes"("fecha_creacion" DESC);

-- CreateIndex
CREATE INDEX "idx_order_items_orden" ON "order_items"("id_orden");

-- CreateIndex
CREATE INDEX "idx_order_items_plan" ON "order_items"("id_plan");

-- CreateIndex
CREATE INDEX "idx_tickets_celular" ON "tickets"("celular_usuario");

-- CreateIndex
CREATE INDEX "idx_tickets_estado" ON "tickets"("estado");

-- CreateIndex
CREATE INDEX "idx_tickets_fecha" ON "tickets"("fecha_creacion" DESC);

-- CreateIndex
CREATE INDEX "idx_ticket_mensajes_ticket" ON "ticket_mensajes"("id_ticket");

-- CreateIndex
CREATE INDEX "idx_ticket_mensajes_timestamp" ON "ticket_mensajes"("timestamp" DESC);

-- AddForeignKey
ALTER TABLE "service_plans" ADD CONSTRAINT "service_plans_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "servicios"("id_servicio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_cuentas" ADD CONSTRAINT "inventario_cuentas_id_plan_fkey" FOREIGN KEY ("id_plan") REFERENCES "service_plans"("id_plan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_cart" ADD CONSTRAINT "shopping_cart_celular_usuario_fkey" FOREIGN KEY ("celular_usuario") REFERENCES "usuarios"("celular") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_cart" ADD CONSTRAINT "shopping_cart_id_plan_fkey" FOREIGN KEY ("id_plan") REFERENCES "service_plans"("id_plan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_celular_usuario_fkey" FOREIGN KEY ("celular_usuario") REFERENCES "usuarios"("celular") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "ordenes"("id_orden") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_id_plan_fkey" FOREIGN KEY ("id_plan") REFERENCES "service_plans"("id_plan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_id_cuenta_asignada_fkey" FOREIGN KEY ("id_cuenta_asignada") REFERENCES "inventario_cuentas"("id_cuenta") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_celular_usuario_fkey" FOREIGN KEY ("celular_usuario") REFERENCES "usuarios"("celular") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_mensajes" ADD CONSTRAINT "ticket_mensajes_id_ticket_fkey" FOREIGN KEY ("id_ticket") REFERENCES "tickets"("id_ticket") ON DELETE CASCADE ON UPDATE CASCADE;

