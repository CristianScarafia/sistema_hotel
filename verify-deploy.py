#!/usr/bin/env python3
"""
Script de verificación para confirmar que el deploy está funcionando
"""
import os
import sys
import django
from pathlib import Path

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings.production')
django.setup()

def print_separator(title):
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def verify_database():
    """Verificar conexión a la base de datos"""
    print_separator("VERIFICACIÓN DE BASE DE DATOS")
    
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            result = cursor.fetchone()
            print(f"✅ PostgreSQL conectado: {result[0]}")
            
            # Verificar tablas
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            print(f"✅ Tablas encontradas: {len(tables)}")
            for table in tables[:5]:  # Mostrar solo las primeras 5
                print(f"  - {table[0]}")
            if len(tables) > 5:
                print(f"  ... y {len(tables) - 5} más")
                
        return True
    except Exception as e:
        print(f"❌ Error de base de datos: {e}")
        return False

def verify_django_models():
    """Verificar modelos de Django"""
    print_separator("VERIFICACIÓN DE MODELOS DJANGO")
    
    try:
        from django.apps import apps
        from django.contrib.auth.models import User
        from reservas.models import PerfilUsuario, Reserva, Habitacion
        
        # Verificar usuarios
        user_count = User.objects.count()
        print(f"✅ Usuarios en la base de datos: {user_count}")
        
        # Verificar perfiles
        perfil_count = PerfilUsuario.objects.count()
        print(f"✅ Perfiles de usuario: {perfil_count}")
        
        # Verificar habitaciones
        habitacion_count = Habitacion.objects.count()
        print(f"✅ Habitaciones: {habitacion_count}")
        
        # Verificar reservas
        reserva_count = Reserva.objects.count()
        print(f"✅ Reservas: {reserva_count}")
        
        return True
    except Exception as e:
        print(f"❌ Error en modelos: {e}")
        return False

def verify_static_files():
    """Verificar archivos estáticos"""
    print_separator("VERIFICACIÓN DE ARCHIVOS ESTÁTICOS")
    
    try:
        from django.conf import settings
        from django.contrib.staticfiles.finders import find
        
        static_root = settings.STATIC_ROOT
        print(f"✅ STATIC_ROOT configurado: {static_root}")
        
        # Verificar si existe el directorio
        if os.path.exists(static_root):
            print(f"✅ Directorio staticfiles existe")
            
            # Contar archivos
            static_files = []
            for root, dirs, files in os.walk(static_root):
                for file in files:
                    static_files.append(os.path.join(root, file))
            
            print(f"✅ Archivos estáticos encontrados: {len(static_files)}")
        else:
            print(f"⚠️ Directorio staticfiles no existe")
            
        return True
    except Exception as e:
        print(f"❌ Error en archivos estáticos: {e}")
        return False

def verify_health_endpoint():
    """Verificar endpoint de health check"""
    print_separator("VERIFICACIÓN DE HEALTH ENDPOINT")
    
    try:
        from django.test import Client
        
        client = Client()
        response = client.get('/health/')
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health endpoint funciona: {data}")
            return True
        else:
            print(f"❌ Health endpoint falló: {response.status_code}")
            print(f"Contenido: {response.content}")
            return False
            
    except Exception as e:
        print(f"❌ Error en health endpoint: {e}")
        return False

def verify_admin_access():
    """Verificar acceso al admin"""
    print_separator("VERIFICACIÓN DE ADMIN")
    
    try:
        from django.test import Client
        
        client = Client()
        response = client.get('/admin/')
        
        if response.status_code == 302:  # Redirect to login
            print(f"✅ Admin accesible (redirige a login)")
            return True
        elif response.status_code == 200:
            print(f"✅ Admin accesible (página cargada)")
            return True
        else:
            print(f"❌ Admin no accesible: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error en admin: {e}")
        return False

def verify_environment():
    """Verificar variables de entorno"""
    print_separator("VERIFICACIÓN DE VARIABLES DE ENTORNO")
    
    important_vars = [
        'DJANGO_SETTINGS_MODULE',
        'SECRET_KEY',
        'PGHOST',
        'PGDATABASE',
        'PGUSER',
        'PGPORT',
        'GUNICORN_WORKERS',
        'GUNICORN_TIMEOUT'
    ]
    
    for var in important_vars:
        value = os.getenv(var)
        if value:
            if 'SECRET' in var or 'PASSWORD' in var:
                print(f"✅ {var}: {'*' * len(value)}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: NO CONFIGURADA")
    
    return True

def main():
    print("🚀 VERIFICACIÓN COMPLETA DEL DEPLOY")
    print(f"Directorio actual: {Path.cwd()}")
    print(f"Python version: {sys.version}")
    
    checks = [
        verify_environment,
        verify_database,
        verify_django_models,
        verify_static_files,
        verify_health_endpoint,
        verify_admin_access
    ]
    
    results = []
    for check in checks:
        try:
            result = check()
            results.append(result)
        except Exception as e:
            print(f"❌ Error en verificación: {e}")
            results.append(False)
    
    print_separator("RESUMEN DE VERIFICACIÓN")
    passed = sum(results)
    total = len(results)
    
    print(f"✅ Verificaciones exitosas: {passed}/{total}")
    
    if passed == total:
        print("🎉 ¡TODAS LAS VERIFICACIONES PASARON! El deploy está funcionando correctamente.")
    else:
        print("⚠️ Algunas verificaciones fallaron. Revisa los errores arriba.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
