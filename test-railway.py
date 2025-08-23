#!/usr/bin/env python3
"""
Script de prueba para verificar la configuración de Railway
"""
import os
import sys
import django
from pathlib import Path

# Agregar el directorio del proyecto al path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings.production')
django.setup()

def test_database_connection():
    """Probar conexión a la base de datos"""
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print(f"✅ Conexión a base de datos exitosa: {result}")
            return True
    except Exception as e:
        print(f"❌ Error de conexión a base de datos: {e}")
        return False

def test_environment_variables():
    """Probar variables de entorno"""
    print("\n🔍 Variables de entorno:")
    print(f"DJANGO_SETTINGS_MODULE: {os.getenv('DJANGO_SETTINGS_MODULE')}")
    print(f"SECRET_KEY: {'✅ Configurada' if os.getenv('SECRET_KEY') else '❌ No configurada'}")
    print(f"PGHOST: {os.getenv('PGHOST')}")
    print(f"PGDATABASE: {os.getenv('PGDATABASE')}")
    print(f"PGUSER: {os.getenv('PGUSER')}")
    print(f"PGPORT: {os.getenv('PGPORT')}")

def test_django_config():
    """Probar configuración de Django"""
    try:
        from django.conf import settings
        print(f"\n✅ Configuración de Django cargada correctamente")
        print(f"DEBUG: {settings.DEBUG}")
        print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
        print(f"CSRF_TRUSTED_ORIGINS: {settings.CSRF_TRUSTED_ORIGINS}")
        return True
    except Exception as e:
        print(f"❌ Error en configuración de Django: {e}")
        return False

def test_health_endpoint():
    """Probar endpoint de health check"""
    try:
        from django.test import Client
        client = Client()
        response = client.get('/health/')
        if response.status_code == 200:
            print(f"✅ Health endpoint funciona: {response.json()}")
            return True
        else:
            print(f"❌ Health endpoint falló: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error en health endpoint: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Iniciando pruebas de configuración de Railway...")
    
    test_environment_variables()
    test_django_config()
    test_database_connection()
    test_health_endpoint()
    
    print("\n✨ Pruebas completadas")
