#!/usr/bin/env node

/**
 * Script de Prueba Simplificado para Sistema de Automatización CUENTY
 * 
 * Este script verifica la configuración sin requerir dependencias externas.
 * 
 * Uso: node test-automation-simple.js
 */

const fs = require('fs');
const path = require('path');

class SimpleAutomationTester {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.successes = [];
        this.basePath = __dirname;
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
        this.log('info', '🚀 Iniciando pruebas simplificadas del sistema de automatización...');
        
        try {
            await this.testFilesExist();
            await this.testPackageJson();
            await this.testEnvExample();
            await this.testDocumentation();
            
            this.showSummary();
            
        } catch (error) {
            this.log('error', `Error crítico durante las pruebas: ${error.message}`);
        }
    }

    async testFilesExist() {
        this.log('info', '📁 Verificando archivos de automatización...');
        
        const files = [
            'services/chatwootAutomationService.js',
            'services/autoAssignmentService.js',
            'services/renewalService.js',
            'services/emailService.js',
            'routes/autoAssignRoutes.js',
            'routes/renewalRoutes.js',
            'server.js'
        ];

        files.forEach(file => {
            const filePath = path.join(this.basePath, file);
            if (fs.existsSync(filePath)) {
                this.log('success', `✅ ${file} encontrado`);
            } else {
                this.log('error', `❌ ${file} no encontrado`);
            }
        });
    }

    async testPackageJson() {
        this.log('info', '📦 Verificando package.json...');
        
        const packagePath = path.join(this.basePath, 'package.json');
        
        if (!fs.existsSync(packagePath)) {
            this.log('error', '❌ package.json no encontrado');
            return;
        }

        try {
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            // Verificar dependencias críticas
            const requiredDeps = [
                'node-cron',
                '@sendgrid/mail',
                'axios',
                'crypto-js'
            ];

            requiredDeps.forEach(dep => {
                if (packageData.dependencies && packageData.dependencies[dep]) {
                    this.log('success', `✅ ${dep}: ${packageData.dependencies[dep]}`);
                } else {
                    this.log('error', `❌ ${dep} no encontrado en dependencies`);
                }
            });

        } catch (error) {
            this.log('error', `❌ Error leyendo package.json: ${error.message}`);
        }
    }

    async testEnvExample() {
        this.log('info', '⚙️  Verificando .env.example...');
        
        const envPath = path.join(this.basePath, '.env.example');
        
        if (!fs.existsSync(envPath)) {
            this.log('error', '❌ .env.example no encontrado');
            return;
        }

        try {
            const envContent = fs.readFileSync(envPath, 'utf8');
            
            // Verificar variables críticas de automatización
            const requiredVars = [
                'ENABLE_AUTO_ASSIGNMENT',
                'ENABLE_AUTO_RENEWALS',
                'ENABLE_AUTO_NOTIFICATIONS',
                'ENABLE_EMAIL_SERVICE',
                'ENABLE_AUTO_CLEANUP',
                'ENABLE_AUTOMATION_DEBUG_LOGS',
                'SENDGRID_API_KEY',
                'ENCRYPTION_KEY'
            ];

            requiredVars.forEach(variable => {
                if (envContent.includes(variable)) {
                    this.log('success', `✅ ${variable} encontrado en .env.example`);
                } else {
                    this.log('warning', `⚠️  ${variable} no encontrado en .env.example`);
                }
            });

        } catch (error) {
            this.log('error', `❌ Error leyendo .env.example: ${error.message}`);
        }
    }

    async testDocumentation() {
        this.log('info', '📚 Verificando documentación...');
        
        const docs = [
            '../AUTOMATION_README.md',
            '../AUTOMATION_FEATURE_FLAGS.md'
        ];

        docs.forEach(doc => {
            const docPath = path.join(this.basePath, doc);
            if (fs.existsSync(docPath)) {
                const stats = fs.statSync(docPath);
                const sizeKB = Math.round(stats.size / 1024);
                this.log('success', `✅ ${path.basename(doc)} encontrado (${sizeKB}KB)`);
            } else {
                this.log('warning', `⚠️  ${path.basename(doc)} no encontrado`);
            }
        });
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
            console.log('   1. Verificar que todos los archivos de automatización estén presentes');
            console.log('   2. Ejecutar: npm install (después de resolver permisos)');
            console.log('   3. Configurar las variables de entorno necesarias');
            console.log('   4. Consultar AUTOMATION_README.md para configuración completa');
        }
        
        console.log('\n🚀 Para activar la automatización:');
        console.log('   1. Copia .env.example a .env');
        console.log('   2. Configura todas las variables de entorno necesarias');
        console.log('   3. Ejecuta: npm install && npm start');
        console.log('   4. Los cron jobs se activarán automáticamente');
        
        console.log('\n📖 Documentación disponible:');
        console.log('   - AUTOMATION_README.md: Guía completa de instalación');
        console.log('   - AUTOMATION_FEATURE_FLAGS.md: Control de funcionalidades');
        console.log('   - test-automation.js: Script de prueba completo');
    }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
    const tester = new SimpleAutomationTester();
    tester.runTests().catch(error => {
        console.error('Error crítico:', error);
        process.exit(1);
    });
}

module.exports = SimpleAutomationTester;