@echo off
REM Script para verificar archivos del frontend

echo 🔍 Verificando archivos del frontend...

REM Verificar que estamos en el directorio correcto
if not exist "frontend" (
    echo [ERROR] No se encuentra la carpeta frontend
    exit /b 1
)

cd frontend

REM Verificar archivos esenciales
echo [INFO] Verificando archivos esenciales...

if exist "package.json" (
    echo [OK] ✅ package.json encontrado
) else (
    echo [ERROR] ❌ package.json no encontrado
    exit /b 1
)

if exist "Dockerfile" (
    echo [OK] ✅ Dockerfile encontrado
) else (
    echo [ERROR] ❌ Dockerfile no encontrado
    exit /b 1
)

if exist "Dockerfile.simple" (
    echo [OK] ✅ Dockerfile.simple encontrado
) else (
    echo [WARNING] ⚠️ Dockerfile.simple no encontrado
)

if exist "Dockerfile.node" (
    echo [OK] ✅ Dockerfile.node encontrado
) else (
    echo [WARNING] ⚠️ Dockerfile.node no encontrado
)

if exist "railway.json" (
    echo [OK] ✅ railway.json encontrado
) else (
    echo [ERROR] ❌ railway.json no encontrado
    exit /b 1
)

if exist "start.sh" (
    echo [OK] ✅ start.sh encontrado
) else (
    echo [ERROR] ❌ start.sh no encontrado
    exit /b 1
)

REM Verificar contenido del railway.json
echo.
echo [INFO] Contenido del railway.json:
type railway.json

echo.
echo [INFO] 🎉 Verificación completada!
echo [INFO] Si todos los archivos están presentes, el deploy debería funcionar.
