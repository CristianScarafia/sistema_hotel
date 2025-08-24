@echo off
REM Script para probar los Dockerfiles localmente en Windows

echo 🧪 Probando builds de Docker...

REM Probar build del backend
echo [INFO] Probando build del backend...
docker build -f Dockerfile.backend -t hotel-backend-test .
if %errorlevel% neq 0 (
    echo [ERROR] ❌ Build del backend falló
    exit /b 1
) else (
    echo [INFO] ✅ Build del backend exitoso
)

REM Probar build del frontend (versión simple)
echo [INFO] Probando build del frontend (versión simple)...
docker build -f frontend/Dockerfile.simple -t hotel-frontend-simple-test ./frontend
if %errorlevel% neq 0 (
    echo [WARNING] ⚠️ Build del frontend (simple) falló
    echo [INFO] Intentando versión alternativa...
    
    REM Probar versión alternativa con Node.js
    docker build -f frontend/Dockerfile.node -t hotel-frontend-node-test ./frontend
    if %errorlevel% neq 0 (
        echo [ERROR] ❌ Build del frontend (Node.js) también falló
        exit /b 1
    ) else (
        echo [INFO] ✅ Build del frontend (Node.js) exitoso
    )
) else (
    echo [INFO] ✅ Build del frontend (simple) exitoso
)

REM Verificar tamaños de las imágenes
echo [INFO] Verificando tamaños de las imágenes...
for /f "tokens=*" %%i in ('docker images hotel-backend-test --format "table {{.Size}}" ^| findstr /v "SIZE"') do set BACKEND_SIZE=%%i
for /f "tokens=*" %%i in ('docker images hotel-frontend-simple-test --format "table {{.Size}}" ^| findstr /v "SIZE" 2^>nul') do set FRONTEND_SIZE=%%i
if "%FRONTEND_SIZE%"=="" (
    for /f "tokens=*" %%i in ('docker images hotel-frontend-node-test --format "table {{.Size}}" ^| findstr /v "SIZE"') do set FRONTEND_SIZE=%%i
)

echo [INFO] Tamaño del backend: %BACKEND_SIZE%
echo [INFO] Tamaño del frontend: %FRONTEND_SIZE%

REM Limpiar imágenes de prueba
echo [INFO] Limpiando imágenes de prueba...
docker rmi hotel-backend-test 2>nul
docker rmi hotel-frontend-simple-test 2>nul
docker rmi hotel-frontend-node-test 2>nul

echo [INFO] 🎉 Todas las pruebas completadas exitosamente!
echo [INFO] Los Dockerfiles están listos para deploy en Railway
