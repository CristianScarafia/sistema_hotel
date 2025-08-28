#!/usr/bin/env python3
"""
Script para diagnosticar problemas de Django en producción
"""
import os
import sys
import django


def log(message):
    print(f"[DEBUG] {message}")


def main():
    log("Iniciando diagnóstico de Django...")

    # Configurar Django
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings.production")

    try:
        log("Configurando Django...")
        django.setup()
        log("✅ Django configurado correctamente")
    except Exception as e:
        log(f"❌ Error configurando Django: {e}")
        return False

    try:
        log("Verificando configuración de base de datos...")
        from django.conf import settings

        log(f"Database config: {settings.DATABASES['default']}")
    except Exception as e:
        log(f"❌ Error en configuración de base de datos: {e}")
        return False

    try:
        log("Probando conexión a base de datos...")
        from django.db import connection

        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            log(f"✅ Conexión a base de datos exitosa: {result}")
    except Exception as e:
        log(f"❌ Error conectando a base de datos: {e}")
        return False

    try:
        log("Verificando URLs...")
        from django.urls import get_resolver

        resolver = get_resolver()
        log(f"✅ URLs configuradas correctamente")
    except Exception as e:
        log(f"❌ Error en configuración de URLs: {e}")
        return False

    try:
        log("Verificando aplicaciones instaladas...")
        from django.conf import settings

        log(f"Installed apps: {settings.INSTALLED_APPS}")
    except Exception as e:
        log(f"❌ Error en aplicaciones instaladas: {e}")
        return False

    log("✅ Diagnóstico completado exitosamente")
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
