#!/bin/bash

echo "=== Desplegando en Railway ==="

# Verificar que Railway CLI esté instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI no está instalado. Instálalo con: npm install -g @railway/cli"
    exit 1
fi

# Verificar que estemos logueados en Railway
if ! railway whoami &> /dev/null; then
    echo "❌ No estás logueado en Railway. Ejecuta: railway login"
    exit 1
fi

echo "✅ Railway CLI configurado correctamente"

# Construir y desplegar
echo "🚀 Iniciando despliegue..."

# Desplegar backend
echo "📦 Desplegando backend..."
cd backend
railway up --service backend

# Desplegar frontend
echo "📦 Desplegando frontend..."
cd ../frontend
railway up --service frontend

echo "✅ Despliegue completado!"
echo "🌐 Tu aplicación está disponible en: https://sistemahotel-production-5a7f.up.railway.app"
