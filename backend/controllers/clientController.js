const { PrismaClient } = require('@prisma/client');
const CryptoJS = require('crypto-js');

const prisma = new PrismaClient();
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

/**
 * Desencriptar credenciales
 */
function decryptCredential(encrypted) {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error al desencriptar:', error);
    return null;
  }
}

/**
 * Obtener historial de órdenes del cliente
 */
const getOrders = async (req, res) => {
  try {
    const clienteId = req.user.clienteId;
    const { estado, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construir filtro
    const where = { clienteId };
    if (estado) {
      where.estado = estado;
    }

    // Obtener órdenes
    const [ordenes, total] = await Promise.all([
      prisma.orden.findMany({
        where,
        skip,
        take,
        orderBy: { fechaCreacion: 'desc' },
        include: {
          items: {
            include: {
              plan: {
                include: {
                  servicio: true
                }
              }
            }
          }
        }
      }),
      prisma.orden.count({ where })
    ]);

    res.json({
      ordenes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ 
      error: 'Error al obtener órdenes',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener detalle de una orden específica
 */
const getOrderById = async (req, res) => {
  try {
    const clienteId = req.user.clienteId;
    const { id } = req.params;

    const orden = await prisma.orden.findFirst({
      where: {
        idOrden: parseInt(id),
        clienteId
      },
      include: {
        items: {
          include: {
            plan: {
              include: {
                servicio: true
              }
            }
          }
        }
      }
    });

    if (!orden) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json({ orden });
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({ 
      error: 'Error al obtener orden',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener cuentas activas del cliente
 */
const getAccounts = async (req, res) => {
  try {
    const clienteId = req.user.clienteId;
    const { servicio } = req.query;

    // Obtener todas las órdenes pagadas del cliente
    const where = {
      clienteId,
      estado: { in: ['pagada', 'entregada'] },
      paymentStatus: 'confirmed'
    };

    const ordenes = await prisma.orden.findMany({
      where,
      include: {
        items: {
          where: {
            estado: { in: ['asignada', 'entregada'] },
            fechaVencimientoServicio: {
              gte: new Date() // Solo cuentas no vencidas
            }
          },
          include: {
            plan: {
              include: {
                servicio: true
              }
            },
            cuentaAsignada: true
          }
        }
      }
    });

    // Extraer cuentas de las órdenes
    let cuentas = [];
    ordenes.forEach(orden => {
      orden.items.forEach(item => {
        if (item.cuentaAsignada) {
          // Filtrar por servicio si se especifica
          if (!servicio || item.plan.servicio.nombre === servicio) {
            cuentas.push({
              id: item.idOrderItem,
              ordenId: orden.idOrden,
              servicio: item.plan.servicio.nombre,
              logoServicio: item.plan.servicio.logoUrl,
              plan: item.plan.nombrePlan,
              fechaInicio: orden.fechaPago || orden.fechaCreacion,
              fechaVencimiento: item.fechaVencimientoServicio,
              estado: item.estado,
              diasRestantes: Math.ceil(
                (new Date(item.fechaVencimientoServicio) - new Date()) / (1000 * 60 * 60 * 24)
              )
            });
          }
        }
      });
    });

    res.json({ cuentas });
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    res.status(500).json({ 
      error: 'Error al obtener cuentas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener credenciales de una cuenta específica
 */
const getAccountCredentials = async (req, res) => {
  try {
    const clienteId = req.user.clienteId;
    const { id } = req.params; // OrderItem ID

    // Verificar que el item pertenece al cliente
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        idOrderItem: parseInt(id)
      },
      include: {
        orden: true,
        plan: {
          include: {
            servicio: true
          }
        },
        cuentaAsignada: true
      }
    });

    if (!orderItem) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    // Verificar que la orden pertenece al cliente
    if (orderItem.orden.clienteId !== clienteId) {
      return res.status(403).json({ error: 'No tienes permiso para ver esta cuenta' });
    }

    // Verificar que la cuenta está asignada
    if (!orderItem.cuentaAsignada) {
      return res.status(400).json({ 
        error: 'Esta cuenta aún no ha sido asignada' 
      });
    }

    // Verificar que la cuenta no está vencida
    if (orderItem.fechaVencimientoServicio && new Date(orderItem.fechaVencimientoServicio) < new Date()) {
      return res.status(400).json({ 
        error: 'Esta cuenta ha vencido' 
      });
    }

    // Desencriptar credenciales
    const email = decryptCredential(orderItem.cuentaAsignada.correoEncriptado);
    const password = decryptCredential(orderItem.cuentaAsignada.contrasenaEncriptada);

    if (!email || !password) {
      return res.status(500).json({ 
        error: 'Error al obtener credenciales' 
      });
    }

    res.json({
      cuenta: {
        servicio: orderItem.plan.servicio.nombre,
        logoServicio: orderItem.plan.servicio.logoUrl,
        plan: orderItem.plan.nombrePlan,
        email,
        password,
        perfil: orderItem.cuentaAsignada.perfil,
        pin: orderItem.cuentaAsignada.pin,
        notas: orderItem.cuentaAsignada.notas,
        fechaVencimiento: orderItem.fechaVencimientoServicio
      }
    });
  } catch (error) {
    console.error('Error al obtener credenciales:', error);
    res.status(500).json({ 
      error: 'Error al obtener credenciales',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener dashboard con resumen de información
 */
const getDashboard = async (req, res) => {
  try {
    const clienteId = req.user.clienteId;

    // Obtener cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: {
        nombre: true,
        apellido: true,
        email: true
      }
    });

    // Contar cuentas activas
    const cuentasActivas = await prisma.orderItem.count({
      where: {
        orden: {
          clienteId,
          estado: { in: ['pagada', 'entregada'] },
          paymentStatus: 'confirmed'
        },
        estado: { in: ['asignada', 'entregada'] },
        fechaVencimientoServicio: {
          gte: new Date()
        }
      }
    });

    // Obtener cuentas próximas a vencer (próximos 7 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 7);

    const cuentasProximasVencer = await prisma.orderItem.findMany({
      where: {
        orden: {
          clienteId,
          estado: { in: ['pagada', 'entregada'] },
          paymentStatus: 'confirmed'
        },
        estado: { in: ['asignada', 'entregada'] },
        fechaVencimientoServicio: {
          gte: new Date(),
          lte: fechaLimite
        }
      },
      include: {
        plan: {
          include: {
            servicio: true
          }
        }
      },
      orderBy: {
        fechaVencimientoServicio: 'asc'
      },
      take: 5
    });

    // Obtener últimas órdenes
    const ultimasOrdenes = await prisma.orden.findMany({
      where: { clienteId },
      orderBy: { fechaCreacion: 'desc' },
      take: 5,
      include: {
        items: {
          include: {
            plan: {
              include: {
                servicio: true
              }
            }
          }
        }
      }
    });

    res.json({
      cliente,
      estadisticas: {
        cuentasActivas,
        cuentasProximasVencer: cuentasProximasVencer.length
      },
      proximosVencimientos: cuentasProximasVencer.map(item => ({
        id: item.idOrderItem,
        servicio: item.plan.servicio.nombre,
        logoServicio: item.plan.servicio.logoUrl,
        plan: item.plan.nombrePlan,
        fechaVencimiento: item.fechaVencimientoServicio,
        diasRestantes: Math.ceil(
          (new Date(item.fechaVencimientoServicio) - new Date()) / (1000 * 60 * 60 * 24)
        )
      })),
      ultimasOrdenes: ultimasOrdenes.map(orden => ({
        id: orden.idOrden,
        fecha: orden.fechaCreacion,
        total: orden.montoTotal,
        estado: orden.estado,
        paymentStatus: orden.paymentStatus,
        itemsCount: orden.items.length
      }))
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({ 
      error: 'Error al obtener dashboard',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  getAccounts,
  getAccountCredentials,
  getDashboard
};
