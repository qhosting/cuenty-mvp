#!/usr/bin/env node

/**
 * Script de Verificación de Endpoints API
 * 
 * Este script verifica que todos los endpoints críticos estén funcionando correctamente.
 * Útil para debugging cuando hay errores 404 reportados.
 */

const http = require('http');
const https = require('https');

// Usar localhost para desarrollo, o la URL configurada en NEXTAUTH_URL
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXTAUTH_URL 
  : 'http://localhost:3001';

const ENDPOINTS = [
  { path: '/api/site-config', method: 'GET', expectedStatus: [200] },
  { path: '/api/auth/session', method: 'GET', expectedStatus: [200] },
  { path: '/api/auth/providers', method: 'GET', expectedStatus: [200] },
  { path: '/api/version', method: 'GET', expectedStatus: [200] },
];

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.path, BASE_URL);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: endpoint.method,
      timeout: 5000,
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          endpoint: endpoint.path,
          status: res.statusCode,
          success: endpoint.expectedStatus.includes(res.statusCode),
          response: data,
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        endpoint: endpoint.path,
        status: 0,
        success: false,
        error: err.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        endpoint: endpoint.path,
        status: 0,
        success: false,
        error: 'Request timeout',
      });
    });

    req.end();
  });
}

async function verifyEndpoints() {
  console.log('🔍 Verificando endpoints API...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    const result = await makeRequest(endpoint);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.endpoint} - Status: ${result.status}`);
    } else {
      console.log(`❌ ${result.endpoint} - ${result.error || `Status: ${result.status}`}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  const failedTests = results.filter(r => !r.success);
  
  if (failedTests.length === 0) {
    console.log('✅ Todos los endpoints funcionan correctamente');
    process.exit(0);
  } else {
    console.log(`❌ ${failedTests.length} endpoint(s) fallaron`);
    console.log('\n🔧 Soluciones sugeridas:');
    console.log('1. Reiniciar el servidor: npm run dev');
    console.log('2. Limpiar caché: rm -rf .next && npm run dev');
    console.log('3. Verificar variables de entorno en .env');
    console.log('4. Verificar que todos los archivos API existan en app/api/');
    process.exit(1);
  }
}

// Verificar que el servidor esté corriendo
const url = new URL(BASE_URL);
const protocol = url.protocol === 'https:' ? https : http;

protocol.get(BASE_URL, (res) => {
  if (res.statusCode === 200 || res.statusCode === 404) {
    verifyEndpoints();
  } else {
    console.error('❌ El servidor no está respondiendo en', BASE_URL);
    console.error('Por favor, inicia el servidor con: npm run dev');
    process.exit(1);
  }
}).on('error', (err) => {
  console.error('❌ No se puede conectar al servidor en', BASE_URL);
  console.error('Error:', err.message);
  console.error('\n🔧 Soluciones:');
  console.error('1. Iniciar el servidor: npm run dev');
  console.error('2. Verificar que el puerto 3001 esté disponible');
  process.exit(1);
});
