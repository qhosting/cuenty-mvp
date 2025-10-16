// Configuración de la API
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

let authToken = localStorage.getItem('cuenty_admin_token');

// Login
async function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.data.token;
            localStorage.setItem('cuenty_admin_token', authToken);
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('dashboard').style.display = 'flex';
            cargarDashboard();
        } else {
            errorDiv.textContent = data.error || 'Credenciales inválidas';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = 'Error al iniciar sesión';
        errorDiv.style.display = 'block';
    }
}

// Logout
function logout() {
    localStorage.removeItem('cuenty_admin_token');
    authToken = null;
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

// Headers con autenticación
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
}

// Verificar autenticación al cargar
window.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        cargarDashboard();
    }
});

// Navegación entre secciones
function showSection(section) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Remover clase active de todos los nav-items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    document.getElementById(`section-${section}`).style.display = 'block';
    
    // Activar nav-item correspondiente
    event.target.classList.add('active');
    
    // Cargar datos según la sección
    switch(section) {
        case 'dashboard':
            cargarDashboard();
            break;
        case 'ordenes':
            cargarOrdenes();
            break;
        case 'productos':
            cargarProductos();
            cargarProductosSelect();
            break;
        case 'cuentas':
            cargarCuentas();
            cargarProductosSelect();
            break;
        case 'usuarios':
            cargarUsuarios();
            break;
        case 'tickets':
            cargarTickets();
            break;
    }
}

// DASHBOARD
async function cargarDashboard() {
    try {
        // Cargar estadísticas de órdenes
        const ordenesRes = await fetch(`${API_URL}/ordenes`, {
            headers: getAuthHeaders()
        });
        const ordenesData = await ordenesRes.json();
        
        if (ordenesData.success) {
            const ordenes = ordenesData.data;
            const pendientes = ordenes.filter(o => o.estado === 'pendiente_pago').length;
            const activas = ordenes.filter(o => o.estado === 'pagada').length;
            
            document.getElementById('stat-ordenes-pendientes').textContent = pendientes;
            document.getElementById('stat-ordenes-activas').textContent = activas;
        }
        
        // Cargar estadísticas de cuentas
        const cuentasRes = await fetch(`${API_URL}/cuentas`, {
            headers: getAuthHeaders()
        });
        const cuentasData = await cuentasRes.json();
        
        if (cuentasData.success) {
            const disponibles = cuentasData.data.filter(c => c.estado === 'disponible').length;
            document.getElementById('stat-cuentas-disponibles').textContent = disponibles;
        }
        
        // Cargar estadísticas de tickets
        const ticketsRes = await fetch(`${API_URL}/tickets/stats/general`, {
            headers: getAuthHeaders()
        });
        const ticketsData = await ticketsRes.json();
        
        if (ticketsData.success) {
            document.getElementById('stat-tickets-abiertos').textContent = ticketsData.data.abiertos;
        }
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

// ÓRDENES
async function cargarOrdenes() {
    const container = document.getElementById('ordenes-container');
    const filtro = document.getElementById('filter-ordenes').value;
    
    container.innerHTML = '<div class="loading">Cargando órdenes...</div>';
    
    try {
        const url = filtro ? `${API_URL}/ordenes?estado=${filtro}` : `${API_URL}/ordenes`;
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>#ID</th>
                            <th>Cliente</th>
                            <th>Servicio</th>
                            <th>Monto</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(orden => `
                            <tr>
                                <td><strong>#${orden.id_orden}</strong></td>
                                <td>${orden.celular_usuario}</td>
                                <td>${orden.nombre_servicio}</td>
                                <td>$${orden.monto_pagado}</td>
                                <td>
                                    <span class="badge ${
                                        orden.estado === 'pagada' ? 'badge-success' :
                                        orden.estado === 'pendiente_pago' ? 'badge-warning' :
                                        'badge-danger'
                                    }">
                                        ${orden.estado}
                                    </span>
                                </td>
                                <td>${new Date(orden.fecha_creacion).toLocaleDateString('es-MX')}</td>
                                <td>
                                    <div class="btn-group">
                                        ${orden.estado === 'pendiente_pago' ? 
                                            `<button onclick="aprobarPago(${orden.id_orden})" class="btn btn-success btn-sm">✅ Aprobar</button>`
                                            : ''
                                        }
                                        <button onclick="verDetallesOrden(${orden.id_orden})" class="btn btn-info btn-sm">👁️ Ver</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<div class="loading">No hay órdenes registradas</div>';
        }
    } catch (error) {
        console.error('Error al cargar órdenes:', error);
        container.innerHTML = '<div class="loading">Error al cargar órdenes</div>';
    }
}

async function aprobarPago(idOrden) {
    if (!confirm('¿Estás seguro de aprobar este pago? Se asignará una cuenta automáticamente.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/ordenes/${idOrden}/aprobar`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Pago aprobado y cuenta asignada exitosamente');
            cargarOrdenes();
            cargarDashboard();
        } else {
            alert('❌ Error: ' + data.error);
        }
    } catch (error) {
        alert('❌ Error al aprobar pago');
    }
}

async function verDetallesOrden(idOrden) {
    try {
        const response = await fetch(`${API_URL}/ordenes/${idOrden}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const orden = data.data;
            mostrarModal('Detalles de Orden #' + idOrden, `
                <div class="form-group">
                    <label>Cliente</label>
                    <input type="text" value="${orden.celular_usuario}" class="input" readonly>
                </div>
                <div class="form-group">
                    <label>Servicio</label>
                    <input type="text" value="${orden.nombre_servicio}" class="input" readonly>
                </div>
                <div class="form-group">
                    <label>Monto</label>
                    <input type="text" value="$${orden.monto_pagado} MXN" class="input" readonly>
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <input type="text" value="${orden.estado}" class="input" readonly>
                </div>
                <div class="form-group">
                    <label>Fecha de Creación</label>
                    <input type="text" value="${new Date(orden.fecha_creacion).toLocaleString('es-MX')}" class="input" readonly>
                </div>
                ${orden.fecha_vencimiento_servicio ? `
                    <div class="form-group">
                        <label>Fecha de Vencimiento</label>
                        <input type="text" value="${new Date(orden.fecha_vencimiento_servicio).toLocaleString('es-MX')}" class="input" readonly>
                    </div>
                ` : ''}
            `);
        }
    } catch (error) {
        alert('Error al cargar detalles');
    }
}

// PRODUCTOS
async function cargarProductos() {
    const container = document.getElementById('productos-container');
    container.innerHTML = '<div class="loading">Cargando productos...</div>';
    
    try {
        const response = await fetch(`${API_URL}/productos`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>#ID</th>
                            <th>Servicio</th>
                            <th>Precio</th>
                            <th>Duración</th>
                            <th>Stock</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(prod => `
                            <tr>
                                <td><strong>#${prod.id_producto}</strong></td>
                                <td>${prod.nombre_servicio}</td>
                                <td>$${prod.precio}</td>
                                <td>${prod.duracion_dias} días</td>
                                <td>${prod.cuentas_disponibles || 0} / ${prod.total_cuentas || 0}</td>
                                <td>
                                    <span class="badge ${prod.activo ? 'badge-success' : 'badge-danger'}">
                                        ${prod.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div class="btn-group">
                                        <button onclick="editarProducto(${prod.id_producto})" class="btn btn-warning btn-sm">✏️</button>
                                        <button onclick="toggleProducto(${prod.id_producto}, ${!prod.activo})" class="btn btn-secondary btn-sm">
                                            ${prod.activo ? '❌' : '✅'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<div class="loading">No hay productos registrados</div>';
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        container.innerHTML = '<div class="loading">Error al cargar productos</div>';
    }
}

function mostrarFormProducto() {
    mostrarModal('Nuevo Producto', `
        <form onsubmit="crearProducto(event)">
            <div class="form-group">
                <label>Nombre del Servicio *</label>
                <input type="text" id="form-nombre" required class="input">
            </div>
            <div class="form-group">
                <label>Descripción</label>
                <textarea id="form-descripcion" class="input"></textarea>
            </div>
            <div class="form-group">
                <label>Precio (MXN) *</label>
                <input type="number" id="form-precio" step="0.01" required class="input">
            </div>
            <div class="form-group">
                <label>Duración (días) *</label>
                <input type="number" id="form-duracion" value="30" required class="input">
            </div>
            <button type="submit" class="btn btn-primary btn-block">Crear Producto</button>
        </form>
    `);
}

async function crearProducto(event) {
    event.preventDefault();
    
    const datos = {
        nombre_servicio: document.getElementById('form-nombre').value,
        descripcion: document.getElementById('form-descripcion').value,
        precio: parseFloat(document.getElementById('form-precio').value),
        duracion_dias: parseInt(document.getElementById('form-duracion').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(datos)
        });
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Producto creado exitosamente');
            cerrarModal();
            cargarProductos();
        } else {
            alert('❌ Error: ' + data.error);
        }
    } catch (error) {
        alert('❌ Error al crear producto');
    }
}

async function toggleProducto(idProducto, nuevoEstado) {
    try {
        const response = await fetch(`${API_URL}/productos/${idProducto}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ activo: nuevoEstado })
        });
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Estado actualizado');
            cargarProductos();
        } else {
            alert('❌ Error: ' + data.error);
        }
    } catch (error) {
        alert('❌ Error al actualizar');
    }
}

// CUENTAS
async function cargarCuentas() {
    const container = document.getElementById('cuentas-container');
    const filtroProducto = document.getElementById('filter-cuentas-producto').value;
    const filtroEstado = document.getElementById('filter-cuentas-estado').value;
    
    container.innerHTML = '<div class="loading">Cargando inventario...</div>';
    
    try {
        let url = `${API_URL}/cuentas?`;
        if (filtroProducto) url += `id_producto=${filtroProducto}&`;
        if (filtroEstado) url += `estado=${filtroEstado}`;
        
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>#ID</th>
                            <th>Servicio</th>
                            <th>Perfil</th>
                            <th>PIN</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(cuenta => `
                            <tr>
                                <td><strong>#${cuenta.id_cuenta}</strong></td>
                                <td>${cuenta.nombre_servicio}</td>
                                <td>${cuenta.perfil || '-'}</td>
                                <td>${cuenta.pin || '-'}</td>
                                <td>
                                    <span class="badge ${
                                        cuenta.estado === 'disponible' ? 'badge-success' :
                                        cuenta.estado === 'asignada' ? 'badge-info' :
                                        'badge-warning'
                                    }">
                                        ${cuenta.estado}
                                    </span>
                                </td>
                                <td>${new Date(cuenta.fecha_agregado).toLocaleDateString('es-MX')}</td>
                                <td>
                                    <div class="btn-group">
                                        <button onclick="verCuenta(${cuenta.id_cuenta})" class="btn btn-info btn-sm">👁️</button>
                                        <button onclick="cambiarEstadoCuenta(${cuenta.id_cuenta}, '${cuenta.estado}')" class="btn btn-warning btn-sm">🔄</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<div class="loading">No hay cuentas en el inventario</div>';
        }
    } catch (error) {
        console.error('Error al cargar cuentas:', error);
        container.innerHTML = '<div class="loading">Error al cargar inventario</div>';
    }
}

function mostrarFormCuenta() {
    cargarProductosSelect().then(productos => {
        mostrarModal('Nueva Cuenta', `
            <form onsubmit="crearCuenta(event)">
                <div class="form-group">
                    <label>Producto *</label>
                    <select id="form-cuenta-producto" required class="input">
                        <option value="">Selecciona un producto</option>
                        ${productos.map(p => `<option value="${p.id_producto}">${p.nombre_servicio}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Correo *</label>
                    <input type="email" id="form-cuenta-correo" required class="input">
                </div>
                <div class="form-group">
                    <label>Contraseña *</label>
                    <input type="text" id="form-cuenta-contrasena" required class="input">
                </div>
                <div class="form-group">
                    <label>Perfil</label>
                    <input type="text" id="form-cuenta-perfil" class="input">
                </div>
                <div class="form-group">
                    <label>PIN</label>
                    <input type="text" id="form-cuenta-pin" class="input">
                </div>
                <button type="submit" class="btn btn-primary btn-block">Agregar Cuenta</button>
            </form>
        `);
    });
}

async function crearCuenta(event) {
    event.preventDefault();
    
    const datos = {
        id_producto: parseInt(document.getElementById('form-cuenta-producto').value),
        correo: document.getElementById('form-cuenta-correo').value,
        contrasena: document.getElementById('form-cuenta-contrasena').value,
        perfil: document.getElementById('form-cuenta-perfil').value,
        pin: document.getElementById('form-cuenta-pin').value
    };
    
    try {
        const response = await fetch(`${API_URL}/cuentas`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(datos)
        });
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Cuenta agregada al inventario');
            cerrarModal();
            cargarCuentas();
            cargarDashboard();
        } else {
            alert('❌ Error: ' + data.error);
        }
    } catch (error) {
        alert('❌ Error al crear cuenta');
    }
}

async function verCuenta(idCuenta) {
    try {
        const response = await fetch(`${API_URL}/cuentas/${idCuenta}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const cuenta = data.data;
            mostrarModal('Detalles de Cuenta #' + idCuenta, `
                <div class="alert alert-warning">
                    ⚠️ Información sensible - Mantener confidencial
                </div>
                <div class="form-group">
                    <label>Servicio</label>
                    <input type="text" value="${cuenta.nombre_servicio}" class="input" readonly>
                </div>
                <div class="form-group">
                    <label>Correo</label>
                    <input type="text" value="${cuenta.correo}" class="input" readonly>
                </div>
                <div class="form-group">
                    <label>Contraseña</label>
                    <input type="text" value="${cuenta.contrasena}" class="input" readonly>
                </div>
                <div class="form-group">
                    <label>Perfil</label>
                    <input type="text" value="${cuenta.perfil || 'N/A'}" class="input" readonly>
                </div>
                <div class="form-group">
                    <label>PIN</label>
                    <input type="text" value="${cuenta.pin || 'N/A'}" class="input" readonly>
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <input type="text" value="${cuenta.estado}" class="input" readonly>
                </div>
            `);
        }
    } catch (error) {
        alert('Error al cargar cuenta');
    }
}

function cambiarEstadoCuenta(idCuenta, estadoActual) {
    const estados = ['disponible', 'asignada', 'mantenimiento'];
    const opciones = estados.map(e => `<option value="${e}" ${e === estadoActual ? 'selected' : ''}>${e}</option>`).join('');
    
    mostrarModal('Cambiar Estado de Cuenta', `
        <form onsubmit="actualizarEstadoCuenta(event, ${idCuenta})">
            <div class="form-group">
                <label>Nuevo Estado</label>
                <select id="form-nuevo-estado" required class="input">
                    ${opciones}
                </select>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Actualizar Estado</button>
        </form>
    `);
}

async function actualizarEstadoCuenta(event, idCuenta) {
    event.preventDefault();
    
    const nuevoEstado = document.getElementById('form-nuevo-estado').value;
    
    try {
        const response = await fetch(`${API_URL}/cuentas/${idCuenta}/estado`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ estado: nuevoEstado })
        });
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Estado actualizado');
            cerrarModal();
            cargarCuentas();
        } else {
            alert('❌ Error: ' + data.error);
        }
    } catch (error) {
        alert('❌ Error al actualizar estado');
    }
}

// USUARIOS
async function cargarUsuarios() {
    const container = document.getElementById('usuarios-container');
    container.innerHTML = '<div class="loading">Cargando usuarios...</div>';
    
    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Celular</th>
                            <th>Fecha Registro</th>
                            <th>Total Órdenes</th>
                            <th>Pagadas</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(usuario => `
                            <tr>
                                <td><strong>${usuario.celular}</strong></td>
                                <td>${new Date(usuario.fecha_creacion).toLocaleDateString('es-MX')}</td>
                                <td>${usuario.total_ordenes}</td>
                                <td>${usuario.ordenes_pagadas}</td>
                                <td>
                                    <button onclick="verDetallesUsuario('${usuario.celular}')" class="btn btn-info btn-sm">👁️ Ver</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<div class="loading">No hay usuarios registrados</div>';
        }
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        container.innerHTML = '<div class="loading">Error al cargar usuarios</div>';
    }
}

async function verDetallesUsuario(celular) {
    try {
        const response = await fetch(`${API_URL}/usuarios/${celular}/estadisticas`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const stats = data.data;
            mostrarModal('Estadísticas de Usuario', `
                <div class="form-group">
                    <label>Celular</label>
                    <input type="text" value="${stats.celular}" class="input" readonly>
                </div>
                <div class="form-group">
                    <label>Fecha de Registro</label>
                    <input type="text" value="${new Date(stats.fecha_creacion).toLocaleDateString('es-MX')}" class="input" readonly>
                </div>
                <div class="form-group">
                    <label>Total de Órdenes</label>
                    <input type="text" value="${stats.total_ordenes}" class="input" readonly>
                </div>
                <div class="form-group">
                    <label>Órdenes Pagadas</label>
                    <input type="text" value="${stats.ordenes_pagadas}" class="input" readonly>
                </div>
                <div class="form-group">
                    <label>Órdenes Pendientes</label>
                    <input type="text" value="${stats.ordenes_pendientes}" class="input" readonly>
                </div>
                <div class="form-group">
                    <label>Tickets Abiertos</label>
                    <input type="text" value="${stats.tickets_abiertos}" class="input" readonly>
                </div>
            `);
        }
    } catch (error) {
        alert('Error al cargar estadísticas');
    }
}

// TICKETS
async function cargarTickets() {
    const container = document.getElementById('tickets-container');
    const filtro = document.getElementById('filter-tickets').value;
    
    container.innerHTML = '<div class="loading">Cargando tickets...</div>';
    
    try {
        const url = filtro ? `${API_URL}/tickets?estado=${filtro}` : `${API_URL}/tickets`;
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>#ID</th>
                            <th>Cliente</th>
                            <th>Problema</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Mensajes</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(ticket => `
                            <tr>
                                <td><strong>#${ticket.id_ticket}</strong></td>
                                <td>${ticket.celular}</td>
                                <td>${ticket.titulo_problema.substring(0, 50)}...</td>
                                <td>
                                    <span class="badge ${
                                        ticket.estado === 'abierto' ? 'badge-danger' :
                                        ticket.estado === 'en_proceso' ? 'badge-warning' :
                                        ticket.estado === 'resuelto' ? 'badge-success' :
                                        'badge-info'
                                    }">
                                        ${ticket.estado}
                                    </span>
                                </td>
                                <td>${new Date(ticket.fecha_creacion).toLocaleDateString('es-MX')}</td>
                                <td>${ticket.total_mensajes}</td>
                                <td>
                                    <button onclick="verTicket(${ticket.id_ticket})" class="btn btn-info btn-sm">💬 Ver</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<div class="loading">No hay tickets registrados</div>';
        }
    } catch (error) {
        console.error('Error al cargar tickets:', error);
        container.innerHTML = '<div class="loading">Error al cargar tickets</div>';
    }
}

async function verTicket(idTicket) {
    try {
        const response = await fetch(`${API_URL}/tickets/${idTicket}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const ticket = data.data;
            const mensajesHTML = ticket.mensajes.map(m => `
                <div class="mensaje-item ${m.remitente === 'agente' ? 'mensaje-agente' : 'mensaje-usuario'}">
                    <div class="mensaje-header">
                        <strong>${m.remitente === 'agente' ? '👨‍💼 Agente' : '👤 Cliente'}</strong>
                        <span>${new Date(m.timestamp).toLocaleString('es-MX')}</span>
                    </div>
                    <div class="mensaje-body">${m.cuerpo_mensaje}</div>
                </div>
            `).join('');
            
            mostrarModal('Ticket #' + idTicket, `
                <div class="alert alert-info">
                    <strong>Cliente:</strong> ${ticket.celular}<br>
                    <strong>Estado:</strong> ${ticket.estado}<br>
                    <strong>Fecha:</strong> ${new Date(ticket.fecha_creacion).toLocaleString('es-MX')}
                </div>
                
                <h4 style="margin: 20px 0 10px;">Problema:</h4>
                <p>${ticket.titulo_problema}</p>
                
                <h4 style="margin: 20px 0 10px;">Conversación:</h4>
                <div class="mensajes-container" style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">
                    ${mensajesHTML}
                </div>
                
                <form onsubmit="responderTicket(event, ${idTicket})">
                    <div class="form-group">
                        <label>Responder como Agente</label>
                        <textarea id="form-respuesta" required class="input" placeholder="Escribe tu respuesta..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Cambiar Estado</label>
                        <select id="form-ticket-estado" class="input">
                            <option value="${ticket.estado}" selected>${ticket.estado}</option>
                            <option value="abierto">Abierto</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="resuelto">Resuelto</option>
                            <option value="cerrado">Cerrado</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Enviar Respuesta</button>
                </form>
                
                <style>
                    .mensaje-item {
                        padding: 12px;
                        margin-bottom: 10px;
                        border-radius: 8px;
                        border-left: 3px solid;
                    }
                    .mensaje-usuario {
                        background: #f3f4f6;
                        border-left-color: #6b7280;
                    }
                    .mensaje-agente {
                        background: #dbeafe;
                        border-left-color: #3b82f6;
                    }
                    .mensaje-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                        font-size: 12px;
                    }
                    .mensaje-body {
                        font-size: 14px;
                        line-height: 1.5;
                    }
                </style>
            `);
        }
    } catch (error) {
        alert('Error al cargar ticket');
    }
}

async function responderTicket(event, idTicket) {
    event.preventDefault();
    
    const respuesta = document.getElementById('form-respuesta').value;
    const nuevoEstado = document.getElementById('form-ticket-estado').value;
    
    try {
        // Agregar mensaje
        await fetch(`${API_URL}/tickets/${idTicket}/mensajes`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                remitente: 'agente',
                cuerpo_mensaje: respuesta,
                nombre_agente: 'Agente de Soporte'
            })
        });
        
        // Actualizar estado
        await fetch(`${API_URL}/tickets/${idTicket}/estado`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        alert('✅ Respuesta enviada exitosamente');
        cerrarModal();
        cargarTickets();
        cargarDashboard();
    } catch (error) {
        alert('❌ Error al enviar respuesta');
    }
}

// UTILIDADES
async function cargarProductosSelect() {
    try {
        const response = await fetch(`${API_URL}/productos`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('filter-cuentas-producto');
            if (select) {
                select.innerHTML = '<option value="">Todos los productos</option>' +
                    data.data.map(p => `<option value="${p.id_producto}">${p.nombre_servicio}</option>`).join('');
            }
            return data.data;
        }
        return [];
    } catch (error) {
        console.error('Error al cargar productos:', error);
        return [];
    }
}

function mostrarModal(titulo, contenido) {
    document.getElementById('modal-title').textContent = titulo;
    document.getElementById('modal-body').innerHTML = contenido;
    document.getElementById('modal').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modal').classList.remove('active');
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        cerrarModal();
    }
}
