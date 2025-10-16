
// Configuración de la API
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Iconos por servicio
const iconosServicios = {
    'Netflix': '🎬',
    'Disney': '🏰',
    'HBO': '🎭',
    'Prime': '📦',
    'Spotify': '🎵',
    'YouTube': '▶️',
    'Crunchyroll': '🎌',
    'Apple': '🍎',
    'Paramount': '⭐',
    'Vix': '📺',
    'Universal': '🎥'
};

// Obtener icono para un servicio
function obtenerIcono(nombreServicio) {
    for (const [key, icon] of Object.entries(iconosServicios)) {
        if (nombreServicio.toLowerCase().includes(key.toLowerCase())) {
            return icon;
        }
    }
    return '📺';
}

// Cargar productos al inicio
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});

// Cargar productos disponibles
async function cargarProductos() {
    const container = document.getElementById('productos-container');
    
    try {
        const response = await fetch(`${API_URL}/productos/activos`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = data.data.map(producto => `
                <div class="producto-card">
                    <div class="producto-icon">${obtenerIcono(producto.nombre_servicio)}</div>
                    <h3 class="producto-nombre">${producto.nombre_servicio}</h3>
                    <p class="producto-descripcion">${producto.descripcion || ''}</p>
                    <div class="producto-precio">$${producto.precio} MXN</div>
                    <div class="producto-duracion">${producto.duracion_dias} días</div>
                    ${producto.cuentas_disponibles > 0 
                        ? `<span class="badge badge-success">✅ ${producto.cuentas_disponibles} disponibles</span>`
                        : `<span class="badge badge-warning">⏳ Sin stock</span>`
                    }
                    <br><br>
                    <button 
                        class="btn btn-primary" 
                        onclick="abrirModalCompra(${producto.id_producto}, '${producto.nombre_servicio}', ${producto.precio})"
                        ${producto.cuentas_disponibles === 0 ? 'disabled' : ''}
                    >
                        Comprar Ahora
                    </button>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="loading">No hay productos disponibles en este momento.</p>';
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        container.innerHTML = '<p class="loading">Error al cargar los productos. Por favor, intenta más tarde.</p>';
    }
}

// Abrir modal de compra
function abrirModalCompra(idProducto, nombreServicio, precio) {
    const modal = document.getElementById('modal-compra');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="alert alert-info">
            <strong>📝 Información de Compra</strong><br>
            Servicio: <strong>${nombreServicio}</strong><br>
            Precio: <strong>$${precio} MXN</strong>
        </div>
        
        <div class="form-group">
            <label>📱 Número de Celular (con código de país)</label>
            <input type="tel" id="celular-compra" placeholder="Ej: +525512345678" class="input" required>
            <small style="color: #6b7280; display: block; margin-top: 5px;">
                Ejemplo: +52 55 1234 5678 (México)
            </small>
        </div>
        
        <div class="alert alert-info">
            <strong>💳 Método de Pago</strong><br>
            Recibirás los datos para transferencia SPEI una vez que confirmes tu orden.
            Tu cuenta será activada inmediatamente después de verificar el pago.
        </div>
        
        <button onclick="confirmarCompra(${idProducto}, '${nombreServicio}', ${precio})" class="btn btn-primary" style="width: 100%;">
            Confirmar Compra
        </button>
    `;
    
    modal.classList.add('active');
}

// Cerrar modal de compra
function cerrarModal() {
    document.getElementById('modal-compra').classList.remove('active');
}

// Confirmar compra
async function confirmarCompra(idProducto, nombreServicio, precio) {
    const celular = document.getElementById('celular-compra').value.trim();
    
    if (!celular) {
        alert('Por favor, ingresa tu número de celular');
        return;
    }
    
    // Validar formato de celular
    if (!celular.startsWith('+')) {
        alert('El número debe incluir el código de país (ej: +525512345678)');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/ordenes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                celular_usuario: celular,
                id_producto: idProducto,
                monto_pagado: precio
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('modal-body').innerHTML = `
                <div class="alert alert-success">
                    <strong>✅ ¡Orden Creada Exitosamente!</strong><br><br>
                    <strong>Número de Orden:</strong> #${data.data.id_orden}<br>
                    <strong>Servicio:</strong> ${nombreServicio}<br>
                    <strong>Total:</strong> $${precio} MXN<br><br>
                    
                    <strong>📋 Datos para Transferencia SPEI:</strong><br>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 10px; margin: 15px 0;">
                        <strong>Banco:</strong> BBVA<br>
                        <strong>CLABE:</strong> 012180001234567890<br>
                        <strong>Referencia:</strong> CUENTY${String(data.data.id_orden).padStart(6, '0')}<br>
                        <strong>Monto:</strong> $${precio} MXN
                    </div>
                    
                    <strong>📱 Siguiente Paso:</strong><br>
                    Una vez realizado el pago, envía tu comprobante por WhatsApp al +52 55 1234 5678.
                    Tu cuenta será activada en menos de 10 minutos.
                    
                    <br><br>
                    <a href="https://wa.me/5215512345678?text=Hola,%20realicé%20el%20pago%20de%20la%20orden%20${data.data.id_orden}" 
                       target="_blank" 
                       class="btn btn-whatsapp" 
                       style="width: 100%; margin-top: 15px;">
                        📱 Enviar Comprobante por WhatsApp
                    </a>
                </div>
            `;
        } else {
            alert('Error al crear la orden: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la compra. Por favor, intenta nuevamente.');
    }
}

// Consultar mis cuentas
async function consultarMisCuentas() {
    const celular = document.getElementById('celular-consulta').value.trim();
    const container = document.getElementById('mis-ordenes-container');
    
    if (!celular) {
        container.innerHTML = '<div class="alert alert-error">Por favor, ingresa tu número de celular</div>';
        return;
    }
    
    container.innerHTML = '<div class="loading">Consultando tus órdenes...</div>';
    
    try {
        const response = await fetch(`${API_URL}/ordenes/usuario/${encodeURIComponent(celular)}`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = `
                <div class="ordenes-grid">
                    ${data.data.map(orden => `
                        <div class="orden-card">
                            <div class="orden-info">
                                <h4>${obtenerIcono(orden.nombre_servicio)} ${orden.nombre_servicio}</h4>
                                <div class="orden-detalles">
                                    <span><strong>Orden #${orden.id_orden}</strong></span>
                                    <span>💰 Precio: $${orden.monto_pagado} MXN</span>
                                    <span>📅 Fecha: ${new Date(orden.fecha_creacion).toLocaleDateString('es-MX')}</span>
                                    ${orden.fecha_vencimiento_servicio ? 
                                        `<span>⏰ Vence: ${new Date(orden.fecha_vencimiento_servicio).toLocaleDateString('es-MX')}</span>` 
                                        : ''
                                    }
                                </div>
                            </div>
                            <div>
                                <div class="orden-estado ${orden.estado === 'pagada' ? 'estado-pagada' : 'estado-pendiente'}">
                                    ${orden.estado === 'pagada' ? '✅ Activa' : '⏳ Pendiente'}
                                </div>
                                ${orden.estado === 'pagada' && orden.id_cuenta_asignada ? 
                                    `<button onclick="verCredenciales(${orden.id_orden})" class="btn btn-primary" style="margin-top: 10px; width: 100%;">
                                        Ver Credenciales
                                    </button>`
                                    : ''
                                }
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<div class="alert alert-info">No se encontraron órdenes para este número de celular.</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="alert alert-error">Error al consultar las órdenes. Por favor, intenta nuevamente.</div>';
    }
}

// Ver credenciales de una orden
async function verCredenciales(idOrden) {
    const modal = document.getElementById('modal-cuenta');
    const modalBody = document.getElementById('modal-cuenta-body');
    
    modalBody.innerHTML = '<div class="loading">Cargando credenciales...</div>';
    modal.classList.add('active');
    
    try {
        const response = await fetch(`${API_URL}/ordenes/${idOrden}`);
        const data = await response.json();
        
        if (data.success && data.data.id_cuenta_asignada) {
            // Obtener credenciales completas
            const cuentaResponse = await fetch(`${API_URL}/webhooks/n8n/obtener-cuenta?id_orden=${idOrden}`, {
                headers: {
                    'X-Webhook-Secret': 'demo-secret'
                }
            });
            const cuentaData = await cuentaResponse.json();
            
            if (cuentaData.success) {
                const cuenta = cuentaData.data;
                modalBody.innerHTML = `
                    <div class="alert alert-success">
                        <strong>✅ Cuenta Activa</strong><br>
                        Válida hasta: ${new Date(cuenta.fecha_vencimiento).toLocaleDateString('es-MX')}
                    </div>
                    
                    <div class="credenciales-box">
                        <div class="credencial-item">
                            <span class="credencial-label">📧 Correo:</span>
                            <span class="credencial-valor">${cuenta.correo}</span>
                        </div>
                        <div class="credencial-item">
                            <span class="credencial-label">🔑 Contraseña:</span>
                            <span class="credencial-valor">${cuenta.contrasena}</span>
                        </div>
                        ${cuenta.perfil ? `
                            <div class="credencial-item">
                                <span class="credencial-label">👤 Perfil:</span>
                                <span class="credencial-valor">${cuenta.perfil}</span>
                            </div>
                        ` : ''}
                        ${cuenta.pin ? `
                            <div class="credencial-item">
                                <span class="credencial-label">📌 PIN:</span>
                                <span class="credencial-valor">${cuenta.pin}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="alert alert-info">
                        <strong>⚠️ Importante:</strong><br>
                        • No compartas estas credenciales<br>
                        • Usa solo el perfil asignado<br>
                        • Contacta soporte si tienes problemas
                    </div>
                `;
            }
        } else {
            modalBody.innerHTML = '<div class="alert alert-error">No se pudieron obtener las credenciales.</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        modalBody.innerHTML = '<div class="alert alert-error">Error al cargar las credenciales.</div>';
    }
}

// Cerrar modal de cuenta
function cerrarModalCuenta() {
    document.getElementById('modal-cuenta').classList.remove('active');
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    const modalCompra = document.getElementById('modal-compra');
    const modalCuenta = document.getElementById('modal-cuenta');
    
    if (event.target === modalCompra) {
        cerrarModal();
    }
    if (event.target === modalCuenta) {
        cerrarModalCuenta();
    }
}
