#!/bin/bash
# Script para crear administrador

echo "🔐 Crear Nuevo Administrador"
echo ""
read -p "Username: " username
read -sp "Password: " password
echo ""
read -p "Email: " email

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$username\",\"password\":\"$password\",\"email\":\"$email\"}"

echo ""
echo "✅ Administrador creado (si no existía)"
