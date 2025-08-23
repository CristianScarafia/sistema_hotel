#!/usr/bin/env python3
"""
Script de diagnóstico para PostgreSQL en Railway
"""
import os
import sys
import socket
import psycopg2
from urllib.parse import urlparse


def log(message):
    print(f"[DIAGNÓSTICO] {message}")


def check_environment_variables():
    """Verificar variables de entorno de PostgreSQL"""
    log("=== VERIFICANDO VARIABLES DE ENTORNO ===")

    # Verificar DATABASE_URL primero
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        log(f"✓ DATABASE_URL: {database_url[:20]}...{database_url[-20:]}")
        return True

    # Verificar variables individuales como fallback
    pg_vars = ["PGHOST", "PGDATABASE", "PGUSER", "PGPASSWORD", "PGPORT"]
    missing_vars = []

    for var in pg_vars:
        value = os.getenv(var)
        if value:
            # Ocultar contraseña
            if var == "PGPASSWORD":
                log(f"✓ {var}: {'*' * len(value)}")
            else:
                log(f"✓ {var}: {value}")
        else:
            log(f"✗ {var}: NO CONFIGURADO")
            missing_vars.append(var)

    if missing_vars:
        log(f"❌ FALTAN VARIABLES: {', '.join(missing_vars)}")
        return False

    log("✅ Todas las variables de PostgreSQL están configuradas")
    return True


def check_network_connectivity():
    """Verificar conectividad de red"""
    log("\n=== VERIFICANDO CONECTIVIDAD DE RED ===")

    host = os.getenv("PGHOST")
    port = int(os.getenv("PGPORT", "5432"))

    if not host:
        log("❌ PGHOST no está configurado")
        return False

    log(f"Intentando conectar a {host}:{port}")

    try:
        # Crear socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)

        # Intentar conexión
        result = sock.connect_ex((host, port))
        sock.close()

        if result == 0:
            log("✅ Conexión de red exitosa")
            return True
        else:
            log(f"❌ Conexión de red falló (código: {result})")
            return False

    except Exception as e:
        log(f"❌ Error de conectividad: {e}")
        return False


def check_postgresql_connection():
    """Verificar conexión directa a PostgreSQL"""
    log("\n=== VERIFICANDO CONEXIÓN A POSTGRESQL ===")

    try:
        # Verificar si tenemos DATABASE_URL
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            log(f"Usando DATABASE_URL para conexión")
            conn = psycopg2.connect(database_url)
        else:
            # Usar variables individuales como fallback
            conn_params = {
                "host": os.getenv("PGHOST"),
                "database": os.getenv("PGDATABASE"),
                "user": os.getenv("PGUSER"),
                "password": os.getenv("PGPASSWORD"),
                "port": int(os.getenv("PGPORT", "5432")),
                "connect_timeout": 10,
            }

            log(f"Conectando a PostgreSQL...")
            log(f"Host: {conn_params['host']}")
            log(f"Database: {conn_params['database']}")
            log(f"User: {conn_params['user']}")
            log(f"Port: {conn_params['port']}")

            conn = psycopg2.connect(**conn_params)

        # Verificar conexión
        with conn.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            log(f"✅ Conexión exitosa a PostgreSQL")
            log(f"Versión: {version}")

        conn.close()
        return True

    except psycopg2.OperationalError as e:
        log(f"❌ Error de conexión PostgreSQL: {e}")
        return False
    except Exception as e:
        log(f"❌ Error inesperado: {e}")
        return False


def check_django_connection():
    """Verificar conexión desde Django"""
    log("\n=== VERIFICANDO CONEXIÓN DESDE DJANGO ===")

    try:
        # Configurar Django
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings.production")

        import django

        django.setup()

        from django.db import connection

        # Verificar conexión
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            result = cursor.fetchone()

        if result[0] == 1:
            log("✅ Django puede conectarse a PostgreSQL")
            return True
        else:
            log("❌ Django no puede conectarse a PostgreSQL")
            return False

    except Exception as e:
        log(f"❌ Error en Django: {e}")
        return False


def main():
    """Función principal de diagnóstico"""
    log("Iniciando diagnóstico de PostgreSQL en Railway")
    log("=" * 50)

    # Verificar variables de entorno
    env_ok = check_environment_variables()
    if not env_ok:
        log("\n❌ DIAGNÓSTICO FALLIDO: Variables de entorno incompletas")
        sys.exit(1)

    # Verificar conectividad de red
    network_ok = check_network_connectivity()
    if not network_ok:
        log("\n❌ DIAGNÓSTICO FALLIDO: Problema de conectividad de red")
        log("   - Verifica que el servicio PostgreSQL esté funcionando")
        log("   - Verifica que los servicios estén en la misma red")
        sys.exit(1)

    # Verificar conexión PostgreSQL
    pg_ok = check_postgresql_connection()
    if not pg_ok:
        log("\n❌ DIAGNÓSTICO FALLIDO: No se puede conectar a PostgreSQL")
        log("   - Verifica las credenciales")
        log("   - Verifica que PostgreSQL esté aceptando conexiones")
        sys.exit(1)

    # Verificar Django
    django_ok = check_django_connection()
    if not django_ok:
        log("\n❌ DIAGNÓSTICO FALLIDO: Django no puede usar PostgreSQL")
        log("   - Verifica la configuración de Django")
        sys.exit(1)

    log("\n✅ DIAGNÓSTICO EXITOSO: Todo está funcionando correctamente")
    log("   PostgreSQL está configurado y accesible desde Django")


if __name__ == "__main__":
    main()
