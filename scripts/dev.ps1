# Script de desarrollo para automatizar tareas comunes (PowerShell)
param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Función de logging
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "OK: $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "WARNING: $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "ERROR: $Message" -ForegroundColor Red
}

# Función para mostrar ayuda
function Show-Help {
    Write-Host "Script de desarrollo para el sistema de hotel" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\scripts\dev.ps1 [COMANDO]"
    Write-Host ""
    Write-Host "Comandos disponibles:"
    Write-Host "  start          - Iniciar todos los servicios"
    Write-Host "  stop           - Detener todos los servicios"
    Write-Host "  restart        - Reiniciar todos los servicios"
    Write-Host "  build          - Reconstruir imágenes Docker"
    Write-Host "  logs           - Mostrar logs de los servicios"
    Write-Host "  shell          - Abrir shell en el contenedor web"
    Write-Host "  migrate        - Ejecutar migraciones"
    Write-Host "  collectstatic  - Recolectar archivos estáticos"
    Write-Host "  superuser      - Crear superusuario"
    Write-Host "  clean          - Limpiar contenedores y volúmenes"
    Write-Host "  help           - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\scripts\dev.ps1 start"
    Write-Host "  .\scripts\dev.ps1 collectstatic"
    Write-Host "  .\scripts\dev.ps1 shell"
}

# Función para iniciar servicios
function Start-Services {
    Write-Log "Iniciando servicios..."
    docker-compose -f docker-compose.dev.yml up -d
    Write-Success "Servicios iniciados"
}

# Función para detener servicios
function Stop-Services {
    Write-Log "Deteniendo servicios..."
    docker-compose -f docker-compose.dev.yml down
    Write-Success "Servicios detenidos"
}

# Función para reiniciar servicios
function Restart-Services {
    Write-Log "Reiniciando servicios..."
    docker-compose -f docker-compose.dev.yml restart
    Write-Success "Servicios reiniciados"
}

# Función para construir imágenes
function Build-Images {
    Write-Log "Construyendo imágenes Docker..."
    docker-compose -f docker-compose.dev.yml build --no-cache
    Write-Success "Imágenes construidas"
}

# Función para mostrar logs
function Show-Logs {
    Write-Log "Mostrando logs..."
    docker-compose -f docker-compose.dev.yml logs -f
}

# Función para abrir shell
function Open-Shell {
    Write-Log "Abriendo shell en el contenedor web..."
    docker-compose -f docker-compose.dev.yml exec web sh
}

# Función para ejecutar migraciones
function Run-Migrations {
    Write-Log "Ejecutando migraciones..."
    docker-compose -f docker-compose.dev.yml exec web python manage.py migrate
    Write-Success "Migraciones completadas"
}

# Función para recolectar archivos estáticos
function Collect-StaticFiles {
    Write-Log "Recolectando archivos estáticos..."
    docker-compose -f docker-compose.dev.yml exec web python manage.py collectstatic --noinput
    Write-Success "Archivos estáticos recolectados"
}

# Función para crear superusuario
function Create-Superuser {
    Write-Log "Creando superusuario..."
    docker-compose -f docker-compose.dev.yml exec web python manage.py crear_supervisor
    Write-Success "Superusuario creado"
}

# Función para limpiar
function Clean-All {
    Write-Warning "Esta acción eliminará todos los contenedores y volúmenes. ¿Estás seguro? (y/N)"
    $response = Read-Host
    if ($response -eq "y" -or $response -eq "Y" -or $response -eq "yes" -or $response -eq "YES") {
        Write-Log "Limpiando contenedores y volúmenes..."
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans
        docker system prune -f
        Write-Success "Limpieza completada"
    } else {
        Write-Log "Limpieza cancelada"
    }
}

# Función principal
switch ($Command.ToLower()) {
    "start" {
        Start-Services
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Restart-Services
    }
    "build" {
        Build-Images
    }
    "logs" {
        Show-Logs
    }
    "shell" {
        Open-Shell
    }
    "migrate" {
        Run-Migrations
    }
    "collectstatic" {
        Collect-StaticFiles
    }
    "superuser" {
        Create-Superuser
    }
    "clean" {
        Clean-All
    }
    "help" {
        Show-Help
    }
    default {
        Write-Error "Comando desconocido: $Command"
        Write-Host ""
        Show-Help
    }
}
