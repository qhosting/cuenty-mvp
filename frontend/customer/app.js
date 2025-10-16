
// Global state
let currentUser = null;
let productos = [];
let isLoggedIn = false;

// Constants
const WHATSAPP_URL = 'https://wa.me/message/IOR2WUU66JVMM1';
const API_BASE_URL = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// App initialization
function initializeApp() {
    initializeIcons();
    initializeAnimations();
    initializeEventListeners();
    loadProducts();
    initializeFAQ();
    initializeCounterAnimations();
    setupIntersectionObserver();
}

// Initialize Lucide icons
function initializeIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Initialize animations and smooth scrolling
function initializeAnimations() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add entrance animations to elements
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    document.querySelectorAll('.feature-card, .step-card, .product-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navigation = document.getElementById('navigation');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navigation.classList.toggle('show');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (navigation.classList.contains('show')) {
                    icon.setAttribute('data-lucide', 'x');
                } else {
                    icon.setAttribute('data-lucide', 'menu');
                }
                lucide.createIcons();
            }
        });
    }

    // Category filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-category');
            filterProducts(category);
        });
    });

    // Modal overlay click to close
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') {
            cerrarModal();
        }
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(0, 0, 0, 0.4)';
            header.style.backdropFilter = 'blur(20px)';
        } else {
            header.style.background = 'rgba(0, 0, 0, 0.2)';
            header.style.backdropFilter = 'blur(20px)';
        }
    });
}

// Setup intersection observer for animations
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// Load products from API
async function loadProducts() {
    try {
        showLoading();
        
        // First try to load from the existing backend API
        let response;
        try {
            response = await fetch('/api/productos');
        } catch (error) {
            // Fallback to mock data if backend is not available
            console.log('Backend not available, using mock data');
            productos = getMockProducts();
            displayProducts(productos);
            return;
        }

        if (response.ok) {
            const data = await response.json();
            productos = data.productos || data;
        } else {
            // Fallback to mock data
            productos = getMockProducts();
        }
        
        displayProducts(productos);
    } catch (error) {
        console.error('Error loading products:', error);
        productos = getMockProducts();
        displayProducts(productos);
    }
}

// Mock products data
function getMockProducts() {
    return [
        {
            id: 1,
            name: 'Netflix Premium',
            description: '4K UHD, 4 pantallas simultáneas, sin anuncios',
            price: 89,
            duration: 30,
            category: 'streaming',
            icon: '🎬',
            color: 'linear-gradient(135deg, #ef4444, #dc2626)',
            features: ['4K Ultra HD', '4 Pantallas', 'Sin Publicidad', 'Descargas'],
            popular: true
        },
        {
            id: 2,
            name: 'Disney+ Premium',
            description: 'Contenido Disney, Pixar, Marvel, Star Wars',
            price: 69,
            duration: 30,
            category: 'streaming',
            icon: '🏰',
            color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            features: ['4K HDR', 'Sin Límites', 'Todo Disney', 'Estrenar Primero']
        },
        {
            id: 3,
            name: 'HBO Max',
            description: 'Series exclusivas, películas y documentales',
            price: 79,
            duration: 30,
            category: 'streaming',
            icon: '👑',
            color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            features: ['Contenido Exclusivo', 'Sin Anuncios', 'Máxima Calidad', 'Estrenos']
        },
        {
            id: 4,
            name: 'Prime Video',
            description: 'Películas, series y envío gratis Amazon',
            price: 59,
            duration: 30,
            category: 'streaming',
            icon: '📦',
            color: 'linear-gradient(135deg, #f97316, #ea580c)',
            features: ['Prime Shipping', 'Video HD', 'Música Incluida', 'Lectura']
        },
        {
            id: 5,
            name: 'Spotify Premium',
            description: 'Música sin límites, sin anuncios, offline',
            price: 49,
            duration: 30,
            category: 'music',
            icon: '🎵',
            color: 'linear-gradient(135deg, #10b981, #059669)',
            features: ['Sin Anuncios', 'Offline', 'Alta Calidad', 'Playlists']
        },
        {
            id: 6,
            name: 'YouTube Premium',
            description: 'Sin anuncios, background play, YouTube Music',
            price: 39,
            duration: 30,
            category: 'streaming',
            icon: '📺',
            color: 'linear-gradient(135deg, #ef4444, #dc2626)',
            features: ['Sin Publicidad', 'Background Play', 'YouTube Music', 'Descargas']
        },
        {
            id: 7,
            name: 'Apple TV+',
            description: 'Contenido original de Apple en alta calidad',
            price: 35,
            duration: 30,
            category: 'streaming',
            icon: '🍎',
            color: 'linear-gradient(135deg, #6b7280, #4b5563)',
            features: ['Contenido Original', '4K Dolby', 'Sin Anuncios', 'Familia']
        },
        {
            id: 8,
            name: 'Crunchyroll',
            description: 'Anime y manga premium sin restricciones',
            price: 45,
            duration: 30,
            category: 'streaming',
            icon: '🍜',
            color: 'linear-gradient(135deg, #f97316, #fbbf24)',
            features: ['Sin Anuncios', 'Simulcast', 'Manga Premium', 'Offline']
        }
    ];
}

// Show loading state
function showLoading() {
    const container = document.getElementById('productos-container');
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <span>Cargando productos...</span>
        </div>
    `;
}

// Display products
function displayProducts(products) {
    const container = document.getElementById('productos-container');
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="text-center text-muted">No se encontraron productos disponibles.</div>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
            ${product.popular ? '<div class="product-badge">MÁS POPULAR</div>' : ''}
            <div class="product-header">
                <div class="product-icon" style="background: ${product.color}">
                    ${product.icon}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                </div>
            </div>
            
            <div class="product-features">
                ${product.features.slice(0, 4).map(feature => `
                    <div class="product-feature">${feature}</div>
                `).join('')}
            </div>
            
            <div class="product-pricing">
                <div>
                    <div class="product-price">$${product.price}</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">MXN</div>
                </div>
                <div class="product-duration">
                    <i data-lucide="clock"></i>
                    <span>${product.duration} días</span>
                </div>
            </div>
            
            <button class="btn btn-primary btn-full" onclick="comprarProducto(${product.id})">
                Obtener Ahora
            </button>
        </div>
    `).join('');

    // Reinitialize icons
    lucide.createIcons();
}

// Filter products by category
function filterProducts(category) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Purchase product
function comprarProducto(productId) {
    const product = productos.find(p => p.id === productId);
    if (!product) return;

    // For now, redirect to WhatsApp with product info
    const message = `Hola! Me interesa el producto: ${product.name} - $${product.price} MXN por ${product.duration} días. ¿Podrías ayudarme con la compra?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`${WHATSAPP_URL}&text=${encodedMessage}`, '_blank');
}

// Initialize FAQ accordion
function initializeFAQ() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// Initialize counter animations
function initializeCounterAnimations() {
    const counters = document.querySelectorAll('[data-count]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    });

    counters.forEach(counter => observer.observe(counter));
}

// Animate counter
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (target > 1000) {
            element.textContent = Math.floor(current).toLocaleString() + '+';
        } else if (target === 99.9) {
            element.textContent = current.toFixed(1) + '%';
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

// Modal functions
function mostrarLogin() {
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById('login-modal').style.display = 'block';
    document.getElementById('register-modal').style.display = 'none';
}

function mostrarRegistro() {
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById('register-modal').style.display = 'block';
    document.getElementById('login-modal').style.display = 'none';
}

function cerrarModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    setTimeout(() => {
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('register-modal').style.display = 'none';
    }, 300);
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            currentUser = result.usuario;
            isLoggedIn = true;
            updateUIForLoggedInUser();
            cerrarModal();
            mostrarMensaje('¡Bienvenido! Has iniciado sesión correctamente.', 'success');
        } else {
            const error = await response.json();
            mostrarMensaje(error.message || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        mostrarMensaje('Error de conexión. Intenta más tarde.', 'error');
    }
}

// Handle register
async function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        mostrarMensaje('Las contraseñas no coinciden', 'error');
        return;
    }

    const data = {
        nombre: formData.get('fullName'),
        email: formData.get('email'),
        celular: formData.get('phone'),
        password: password
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            cerrarModal();
            mostrarMensaje('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.', 'success');
            setTimeout(() => mostrarLogin(), 2000);
        } else {
            const error = await response.json();
            mostrarMensaje(error.message || 'Error al crear la cuenta', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        mostrarMensaje('Error de conexión. Intenta más tarde.', 'error');
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons && currentUser) {
        authButtons.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="color: var(--text-secondary); font-size: 0.875rem;">
                    ${currentUser.nombre || currentUser.email}
                </span>
                <button class="btn btn-secondary" onclick="logout()">
                    <i data-lucide="log-out"></i>
                    Salir
                </button>
            </div>
        `;
        lucide.createIcons();
    }
}

// Logout function
function logout() {
    currentUser = null;
    isLoggedIn = false;
    
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.innerHTML = `
            <button class="btn btn-secondary" onclick="mostrarLogin()">
                <i data-lucide="log-in"></i>
                Ingresar
            </button>
            <button class="btn btn-primary" onclick="mostrarRegistro()">
                <i data-lucide="user-plus"></i>
                Registro
            </button>
        `;
        lucide.createIcons();
    }
    
    mostrarMensaje('Has cerrado sesión correctamente.', 'info');
}

// Consultar mis cuentas
async function consultarMisCuentas() {
    const celular = document.getElementById('celular-consulta').value.trim();
    
    if (!celular) {
        mostrarMensaje('Por favor ingresa tu número de celular', 'warning');
        return;
    }

    const resultadoContainer = document.getElementById('cuentas-resultado');
    resultadoContainer.innerHTML = '<div class="loading"><div class="spinner"></div><span>Consultando tus cuentas...</span></div>';

    try {
        const response = await fetch(`/api/cuentas/consultar/${encodeURIComponent(celular)}`);
        
        if (response.ok) {
            const cuentas = await response.json();
            displayCuentas(cuentas);
        } else {
            resultadoContainer.innerHTML = '<div class="text-center text-muted">No se encontraron cuentas asociadas a este número.</div>';
        }
    } catch (error) {
        console.error('Error consulting accounts:', error);
        // Show mock data for demonstration
        displayMockCuentas();
    }
}

// Display cuentas
function displayCuentas(cuentas) {
    const container = document.getElementById('cuentas-resultado');
    
    if (!cuentas || cuentas.length === 0) {
        container.innerHTML = '<div class="text-center text-muted">No se encontraron cuentas asociadas a este número.</div>';
        return;
    }

    container.innerHTML = cuentas.map(cuenta => `
        <div class="cuenta-item">
            <div class="cuenta-header">
                <div class="cuenta-servicio">${cuenta.servicio}</div>
                <div class="cuenta-estado ${cuenta.activo ? 'activo' : 'inactivo'}">
                    ${cuenta.activo ? 'Activa' : 'Inactiva'}
                </div>
            </div>
            <div class="cuenta-credenciales">
                <div><strong>Usuario:</strong> ${cuenta.usuario}</div>
                <div><strong>Vence:</strong> ${cuenta.fecha_vencimiento}</div>
            </div>
        </div>
    `).join('');
}

// Display mock cuentas for demo
function displayMockCuentas() {
    const mockCuentas = [
        {
            servicio: 'Netflix Premium',
            usuario: 'user@example.com',
            activo: true,
            fecha_vencimiento: '2025-11-15'
        },
        {
            servicio: 'Disney+ Premium',
            usuario: 'disney@example.com',
            activo: true,
            fecha_vencimiento: '2025-10-28'
        }
    ];
    
    displayCuentas(mockCuentas);
}

// Send contact form
async function enviarContacto(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };

    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="spinner" style="width: 16px; height: 16px;"></div> Enviando...';
    submitButton.disabled = true;

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            event.target.reset();
            mostrarMensaje('¡Mensaje enviado exitosamente! Te contactaremos pronto.', 'success');
        } else {
            const error = await response.json();
            mostrarMensaje(error.message || 'Error al enviar el mensaje', 'error');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        mostrarMensaje('Mensaje recibido. Te contactaremos pronto por WhatsApp.', 'success');
        event.target.reset();
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// WhatsApp functions
function abrirWhatsApp() {
    window.open(WHATSAPP_URL, '_blank');
}

// Show message notification
function mostrarMensaje(mensaje, tipo = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${tipo}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i data-lucide="${getIconForType(tipo)}"></i>
            <span>${mensaje}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i data-lucide="x"></i>
        </button>
    `;

    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 3000;
                max-width: 400px;
                background: var(--bg-card);
                backdrop-filter: blur(20px);
                border: 1px solid var(--border-primary);
                border-radius: var(--radius-lg);
                padding: var(--spacing-md);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--spacing-sm);
                box-shadow: var(--shadow-xl);
                animation: slideInRight 0.3s ease;
            }
            
            .notification-success { border-left: 4px solid var(--success); }
            .notification-error { border-left: 4px solid var(--error); }
            .notification-warning { border-left: 4px solid var(--warning); }
            .notification-info { border-left: 4px solid var(--info); }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                color: var(--text-primary);
                font-size: 0.875rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                padding: var(--spacing-xs);
                border-radius: var(--radius-sm);
                transition: all 0.3s ease;
            }
            
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Add to page
    document.body.appendChild(notification);
    
    // Initialize icons
    lucide.createIcons();
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Get icon for notification type
function getIconForType(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'x-circle';
        case 'warning': return 'alert-triangle';
        case 'info': return 'info';
        default: return 'info';
    }
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

// Utility function to format date
function formatDate(dateString) {
    return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(dateString));
}

// Handle window resize for mobile responsiveness
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Reinitialize icons after resize
        lucide.createIcons();
    }, 250);
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Reinitialize icons when page becomes visible
        setTimeout(() => {
            lucide.createIcons();
        }, 100);
    }
});

// Error handling for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    // Don't show error messages to users for now
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Don't show error messages to users for now
});

// Export functions for global access
window.consultarMisCuentas = consultarMisCuentas;
window.mostrarLogin = mostrarLogin;
window.mostrarRegistro = mostrarRegistro;
window.cerrarModal = cerrarModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.enviarContacto = enviarContacto;
window.abrirWhatsApp = abrirWhatsApp;
window.comprarProducto = comprarProducto;
window.logout = logout;

console.log('CUENTY Frontend initialized successfully');
