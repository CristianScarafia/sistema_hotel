#!/usr/bin/env python3
"""
Script simple para probar conexión a PostgreSQL usando DATABASE_URL
"""
import os
import sys
import psycopg2


def log(message):
    print(f"[TEST-DB] {message}")


def main():
    log("Iniciando prueba de conexión a PostgreSQL")

    # Verificar DATABASE_URL
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        log("❌ ERROR: DATABASE_URL no está configurada")
        log("   Configura la variable DATABASE_URL en Railway")
        sys.exit(1)

    log(f"✓ DATABASE_URL encontrada: {database_url[:20]}...{database_url[-20:]}")

    try:
        # Intentar conexión directa
        log("Intentando conectar a PostgreSQL...")
        conn = psycopg2.connect(database_url)

        # Verificar conexión
        with conn.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            log(f"✅ Conexión exitosa a PostgreSQL")
            log(f"Versión: {version}")

        conn.close()
        log("✅ PRUEBA EXITOSA: PostgreSQL está funcionando correctamente")
        sys.exit(0)

    except psycopg2.OperationalError as e:
        log(f"❌ Error de conexión PostgreSQL: {e}")
        sys.exit(1)
    except Exception as e:
        log(f"❌ Error inesperado: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
