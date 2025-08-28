# Script de PowerShell para desplegar en Railway
Write-Host "=== Desplegando en Railway ===" -ForegroundColor Green

# Verificar que Railway CLI esté instalado
try {
    $null = Get-Command railway -ErrorAction Stop
    Write-Host "✅ Railway CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI no está instalado. Instálalo con: npm install -g @railway/cli" -ForegroundColor Red
    exit 1
}

# Verificar que estemos logueados en Railway
try {
    railway whoami | Out-Null
    Write-Host "✅ Logueado en Railway" -ForegroundColor Green
} catch {
    Write-Host "❌ No estás logueado en Railway. Ejecuta: railway login" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Iniciando despliegue..." -ForegroundColor Yellow

# Desplegar backend
Write-Host "📦 Desplegando backend..." -ForegroundColor Cyan
Set-Location backend
railway up --service backend

# Desplegar frontend
Write-Host "📦 Desplegando frontend..." -ForegroundColor Cyan
Set-Location ../frontend
railway up --service frontend

Write-Host "✅ Despliegue completado!" -ForegroundColor Green
Write-Host "🌐 Tu aplicación está disponible en: https://sistemahotel-production-5a7f.up.railway.app" -ForegroundColor Green
