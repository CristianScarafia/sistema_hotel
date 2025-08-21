# Script de PowerShell para el entorno de desarrollo del Sistema Hotel
param(
    [Parameter(Position=0)]
    [ValidateSet("up", "down", "restart", "logs", "build", "status")]
    [string]$Command = "status"
)

$ComposeFile = "docker-compose.dev.yml"

Write-Host "🏨 Sistema Hotel - Entorno de Desarrollo" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

switch ($Command) {
    "up" {
        Write-Host "🚀 Levantando servicios..." -ForegroundColor Green
        docker-compose -f $ComposeFile up -d
        Write-Host "✅ Servicios levantados correctamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 URLs disponibles:" -ForegroundColor Yellow
        Write-Host "   🌐 Frontend React: http://localhost:3000" -ForegroundColor White
        Write-Host "   🔧 Backend Django: http://localhost:8000" -ForegroundColor White
        Write-Host "   🗄️  Base de datos: localhost:5432" -ForegroundColor White
        Write-Host ""
        Write-Host "👤 Credenciales de acceso:" -ForegroundColor Yellow
        Write-Host "   Usuario: admin" -ForegroundColor White
        Write-Host "   Contraseña: admin123" -ForegroundColor White
    }
    
    "down" {
        Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Red
        docker-compose -f $ComposeFile down
        Write-Host "✅ Servicios detenidos correctamente" -ForegroundColor Green
    }
    
    "restart" {
        Write-Host "🔄 Reiniciando servicios..." -ForegroundColor Yellow
        docker-compose -f $ComposeFile restart
        Write-Host "✅ Servicios reiniciados correctamente" -ForegroundColor Green
    }
    
    "logs" {
        Write-Host "📋 Mostrando logs..." -ForegroundColor Blue
        docker-compose -f $ComposeFile logs -f
    }
    
    "build" {
        Write-Host "🔨 Construyendo imágenes..." -ForegroundColor Magenta
        docker-compose -f $ComposeFile build --no-cache
        Write-Host "✅ Imágenes construidas correctamente" -ForegroundColor Green
    }
    
    "status" {
        Write-Host "📊 Estado de los servicios:" -ForegroundColor Blue
        docker-compose -f $ComposeFile ps
        Write-Host ""
        Write-Host "📋 URLs disponibles:" -ForegroundColor Yellow
        Write-Host "   🌐 Frontend React: http://localhost:3000" -ForegroundColor White
        Write-Host "   🔧 Backend Django: http://localhost:8000" -ForegroundColor White
        Write-Host "   🗄️  Base de datos: localhost:5432" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🛠️  Comandos disponibles:" -ForegroundColor Cyan
Write-Host "   .\scripts\dev.ps1 up      - Levantar servicios" -ForegroundColor Gray
Write-Host "   .\scripts\dev.ps1 down    - Detener servicios" -ForegroundColor Gray
Write-Host "   .\scripts\dev.ps1 restart - Reiniciar servicios" -ForegroundColor Gray
Write-Host "   .\scripts\dev.ps1 logs    - Ver logs" -ForegroundColor Gray
Write-Host "   .\scripts\dev.ps1 build   - Construir imágenes" -ForegroundColor Gray
Write-Host "   .\scripts\dev.ps1 status  - Ver estado" -ForegroundColor Gray
