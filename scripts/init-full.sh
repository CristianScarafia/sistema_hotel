#!/bin/bash

echo "🚀 Inicializando Sistema de Hotel Completo (Backend + Frontend)"

# Crear directorio frontend si no existe
if [ ! -d "frontend" ]; then
    echo "📁 Creando directorio frontend..."
    mkdir -p frontend
fi

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18 o superior."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm."
    exit 1
fi

echo "✅ Node.js y npm están instalados"

# Inicializar React app si no existe
if [ ! -f "frontend/package.json" ]; then
    echo "⚛️  Inicializando aplicación React..."
    cd frontend
    npx create-react-app . --template typescript --yes
    cd ..
fi

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install axios react-router-dom react-toastify react-hook-form react-datepicker react-icons tailwindcss autoprefixer postcss
cd ..

# Configurar Tailwind CSS
echo "🎨 Configurando Tailwind CSS..."
cd frontend
npx tailwindcss init -p
cd ..

# Construir y levantar contenedores
echo "🐳 Construyendo y levantando contenedores..."
docker-compose -f docker-compose.full.yml down
docker-compose -f docker-compose.full.yml build
docker-compose -f docker-compose.full.yml up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Ejecutar migraciones
echo "🗄️  Ejecutando migraciones..."
docker-compose -f docker-compose.full.yml exec web python manage.py migrate

# Crear superusuario si no existe
echo "👤 Creando superusuario..."
docker-compose -f docker-compose.full.yml exec web python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@hotel.com', 'admin123')
    print('Superusuario creado: admin/admin123')
else:
    print('Superusuario ya existe')
"

# Recolectar archivos estáticos
echo "📁 Recolectando archivos estáticos..."
docker-compose -f docker-compose.full.yml exec web python manage.py collectstatic --noinput

echo "🎉 ¡Sistema inicializado correctamente!"
echo ""
echo "📋 URLs disponibles:"
echo "   🌐 Frontend React: http://localhost:3000"
echo "   🔧 Backend Django: http://localhost:8000"
echo "   📚 API Docs: http://localhost:8000/api-docs/"
echo "   🔐 Admin Django: http://localhost:8000/admin/"
echo ""
echo "👤 Credenciales de acceso:"
echo "   Usuario: admin"
echo "   Contraseña: admin123"
echo ""
echo "🛠️  Comandos útiles:"
echo "   Ver logs: docker-compose -f docker-compose.full.yml logs -f"
echo "   Parar servicios: docker-compose -f docker-compose.full.yml down"
echo "   Reiniciar: docker-compose -f docker-compose.full.yml restart"
