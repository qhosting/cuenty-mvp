/**
 * Script de Prueba para Sistema de Automatización CUENTY
 * 
 * Este script verifica que todos los componentes de automatización 
 * estén correctamente configurados y funcionando.
 * 
 * Uso: node test-automation.js
 */

require('dotenv').config();
const axios = require('axios');

class AutomationTester {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.successes = [];
        this.config = {
            // Feature Flags
            autoAssignmentEnabled: process.env.ENABLE_AUTO_ASSIGNMENT === 'true',
            autoRenewalsEnabled: process.env.ENABLE_AUTO_RENEWALS === 'true',
            autoNotificationsEnabled: process.env.ENABLE_AUTO_NOTIFICATIONS === 'true',
            emailServiceEnabled: process.env.ENABLE_EMAIL_SERVICE === 'true',
            autoCleanupEnabled: process.env.ENABLE_AUTO_CLEANUP === 'true',
            debugLogsEnabled: process.env.ENABLE_AUTOMATION_DEBUG_LOGS === 'true',
            
            // Configuración de APIs
            chatwootUrl: process.env.CHATWOOT_URL,
            chatwootToken: process.env.CHATWOOT_API_TOKEN,
            chatwootAccountId: process.env.CHATWOOT_ACCOUNT_ID,
            chatwootInboxId: process.env.CHATWOOT_INBOX_ID,
            sendgridApiKey: process.env.SENDGRID_API_KEY,
            
            // Configuración de seguridad
            encryptionKey: process.env.ENCRYPTION_KEY,
            encryptionAlgorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc'
        };
    }

    log(level, message) {
        const timestamp = new Date().toISOString();
        const prefix = {
            'error': '❌ ERROR',
            'warning': '⚠️  WARNING', 
            'success': '✅ SUCCESS',
            'info': 'ℹ️  INFO'
        }[level] || 'ℹ️  INFO';

        console.log(`${prefix} [${timestamp}] ${message}`);
        
        if (level === 'error') this.errors.push(message);
        if (level === 'warning') this.warnings.push(message);
        if (level === 'success') this.successes.push(message);
    }

    async runTests() {
        this.log('info', '🚀 Iniciando pruebas del sistema de automatización...');
        
        try {
            await this.testEnvironmentVariables();
            await this.testFeatureFlags();
            await this.testServices();
            await this.testAPIs();
            await this.testCronJobs();
            
            this.showSummary();
            
        } catch (error) {
            this.log('error', `Error crítico durante las pruebas: ${error.message}`);
        }
    }

    async testEnvironmentVariables() {
        this.log('info', '📋 Probando variables de entorno...');
        
        // Variables críticas
        const criticalVars = [
            'CHATWOOT_URL', 'CHATWOOT_API_TOKEN', 'CHATWOOT_ACCOUNT_ID',
            'ENCRYPTION_KEY'
        ];
        
        for (const variable of criticalVars) {
            const value = process.env[variable];
            if (!value || value === `tu_${variable.toLowerCase()}_aqui`) {
                this.log('error', `Variable ${variable} no está configurada o usa valor por defecto`);
            } else {
                this.log('success', `✅ ${variable} está configurada`);
            }
        }

        // Validar longitud de clave de encriptación
        if (this.config.encryptionKey && this.config.encryptionKey.length !== 32) {
            this.log('error', `ENCRYPTION_KEY debe tener exactamente 32 caracteres, tiene ${this.config.encryptionKey.length}`);
        } else if (this.config.encryptionKey) {
            this.log('success', '✅ ENCRYPTION_KEY tiene longitud correcta');
        }
    }

    async testFeatureFlags() {
        this.log('info', '🏁 Probando Feature Flags...');
        
        const flags = {
            'ENABLE_AUTO_ASSIGNMENT': this.config.autoAssignmentEnabled,
            'ENABLE_AUTO_RENEWALS': this.config.autoRenewalsEnabled,
            'ENABLE_AUTO_NOTIFICATIONS': this.config.autoNotificationsEnabled,
            'ENABLE_EMAIL_SERVICE': this.config.emailServiceEnabled,
            'ENABLE_AUTO_CLEANUP': this.config.autoCleanupEnabled,
            'ENABLE_AUTOMATION_DEBUG_LOGS': this.config.debugLogsEnabled
        };

        Object.entries(flags).forEach(([flag, enabled]) => {
            if (enabled) {
                this.log('success', `✅ ${flag} está HABILITADO`);
            } else {
                this.log('warning', `⚠️  ${flag} está DESHABILITADO`);
            }
        });
    }

    async testServices() {
        this.log('info', '🔧 Probando servicios de automatización...');
        
        try {
            // Verificar si los archivos de servicio existen
            const services = [
                './services/chatwootAutomationService',
                './services/autoAssignmentService', 
                './services/renewalService',
                './services/emailService'
            ];

            for (const service of services) {
                try {
                    require.resolve(service);
                    this.log('success', `✅ ${service} cargado correctamente`);
                } catch (error) {
                    this.log('error', `❌ No se pudo cargar ${service}: ${error.message}`);
                }
            }

            // Verificar rutas
            const routes = [
                './routes/autoAssignRoutes',
                './routes/renewalRoutes'
            ];

            for (const route of routes) {
                try {
                    require.resolve(route);
                    this.log('success', `✅ ${route} cargado correctamente`);
                } catch (error) {
                    this.log('error', `❌ No se pudo cargar ${route}: ${error.message}`);
                }
            }

        } catch (error) {
            this.log('error', `Error probando servicios: ${error.message}`);
        }
    }

    async testAPIs() {
        this.log('info', '🌐 Probando conexiones API...');
        
        // Probar conexión con Chatwoot
        if (this.config.chatwootUrl && this.config.chatwootToken) {
            try {
                const response = await axios.get(`${this.config.chatwootUrl}/api/v1/accounts`, {
                    headers: {
                        'api_access_token': this.config.chatwootToken,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });
                
                if (response.status === 200) {
                    this.log('success', '✅ Conexión con Chatwoot API establecida');
                } else {
                    this.log('warning', `⚠️  Chatwoot API respondió con código ${response.status}`);
                }
            } catch (error) {
                this.log('error', `❌ Error conectando con Chatwoot: ${error.message}`);
            }
        }

        // Probar configuración de SendGrid
        if (this.config.sendgridApiKey && this.config.sendgridApiKey !== 'tu_api_key_de_sendgrid') {
            try {
                const response = await axios.get('https://api.sendgrid.com/v3/user/account', {
                    headers: {
                        'Authorization': `Bearer ${this.config.sendgridApiKey}`
                    },
                    timeout: 10000
                });
                
                if (response.status === 200) {
                    this.log('success', '✅ Conexión con SendGrid API establecida');
                } else {
                    this.log('warning', `⚠️  SendGrid API respondió con código ${response.status}`);
                }
            } catch (error) {
                this.log('error', `❌ Error conectando con SendGrid: ${error.message}`);
            }
        }
    }

    async testCronJobs() {
        this.log('info', '⏰ Probando configuración de Cron Jobs...');
        
        // Verificar que node-cron esté disponible
        try {
            require('node-cron');
            this.log('success', '✅ node-cron disponible');
        } catch (error) {
            this.log('error', '❌ node-cron no está disponible');
        }

        // Verificar configuración de horarios
        const dailyCheckTime = process.env.DAILY_RENEWAL_CHECK_TIME || '09:00';
        const cleanupTime = process.env.DAILY_LOG_CLEANUP_TIME || '02:00';
        
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        
        if (timeRegex.test(dailyCheckTime)) {
            this.log('success', `✅ DAILY_RENEWAL_CHECK_TIME formato correcto: ${dailyCheckTime}`);
        } else {
            this.log('error', `❌ DAILY_RENEWAL_CHECK_TIME formato inválido: ${dailyCheckTime} (formato: HH:MM)`);
        }
        
        if (timeRegex.test(cleanupTime)) {
            this.log('success', `✅ DAILY_LOG_CLEANUP_TIME formato correcto: ${cleanupTime}`);
        } else {
            this.log('error', `❌ DAILY_LOG_CLEANUP_TIME formato inválido: ${cleanupTime} (formato: HH:MM)`);
        }
    }

    showSummary() {
        this.log('info', '📊 Resumen de Pruebas de Automatización');
        console.log('\n' + '='.repeat(60));
        
        this.log('info', `✅ Exitosas: ${this.successes.length}`);
        this.log('warning', `⚠️  Advertencias: ${this.warnings.length}`);
        this.log('error', `❌ Errores: ${this.errors.length}`);
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            this.log('success', '🎉 ¡Sistema de automatización completamente configurado!');
        } else if (this.errors.length === 0) {
            this.log('success', '👍 Sistema de automatización funcional con advertencias menores');
        } else {
            this.log('error', '🚨 Sistema de automatización requiere correcciones antes del uso');
        }

        console.log('='.repeat(60));

        // Mostrar advertencias si existen
        if (this.warnings.length > 0) {
            console.log('\n⚠️  ADVERTENCIAS:');
            this.warnings.forEach(warning => console.log(`   - ${warning}`));
        }

        // Mostrar errores si existen
        if (this.errors.length > 0) {
            console.log('\n❌ ERRORES:');
            this.errors.forEach(error => console.log(`   - ${error}`));
            
            console.log('\n🔧 RECOMENDACIONES:');
            console.log('   1. Revisa las variables de entorno en tu archivo .env');
            console.log('   2. Instala las dependencias: npm install');
            console.log('   3. Configura las APIs (Chatwoot y SendGrid)');
            console.log('   4. Consulta la documentación en AUTOMATION_README.md');
        }
        
        console.log('\n🚀 Para activar la automatización:');
        console.log('   1. Configura todas las variables de entorno necesarias');
        console.log('   2. Ejecuta: npm start');
        console.log('   3. Los cron jobs se activarán automáticamente');
    }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
    const tester = new AutomationTester();
    tester.runTests().catch(error => {
        console.error('Error crítico:', error);
        process.exit(1);
    });
}

module.exports = AutomationTester;