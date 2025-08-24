#!/usr/bin/env python3
"""
Health check script para Railway
Verifica que la aplicación Django esté funcionando correctamente
"""

import os
import sys
import django
import requests
from urllib.parse import urljoin

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings.production')
django.setup()

def check_django_app():
    """Verificar que Django esté funcionando"""
    try:
        from django.core.management import execute_from_command_line
        from django.core.management.base import CommandError
        
        # Verificar configuración de Django
        execute_from_command_line(['manage.py', 'check'])
        print("✅ Django configuration OK")
        return True
    except Exception as e:
        print(f"❌ Django configuration error: {e}")
        return False

def check_database():
    """Verificar conexión a la base de datos"""
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            if result and result[0] == 1:
                print("✅ Database connection OK")
                return True
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False
    return False

def check_health_endpoint():
    """Verificar endpoint de health check"""
    try:
        # Obtener puerto desde variable de entorno
        port = os.environ.get('PORT', '8000')
        base_url = f"http://localhost:{port}"
        
        # Intentar hacer request al health endpoint
        response = requests.get(urljoin(base_url, '/health/'), timeout=10)
        if response.status_code == 200:
            print("✅ Health endpoint OK")
            return True
        else:
            print(f"❌ Health endpoint returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def main():
    """Función principal de health check"""
    print("🔍 Iniciando health check...")
    
    checks = [
        ("Django App", check_django_app),
        ("Database", check_database),
        ("Health Endpoint", check_health_endpoint),
    ]
    
    all_passed = True
    
    for check_name, check_func in checks:
        print(f"\n📋 Verificando {check_name}...")
        if not check_func():
            all_passed = False
    
    print(f"\n{'='*50}")
    if all_passed:
        print("🎉 Todos los health checks pasaron exitosamente!")
        sys.exit(0)
    else:
        print("💥 Algunos health checks fallaron!")
        sys.exit(1)

if __name__ == "__main__":
    main()
