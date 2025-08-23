#!/usr/bin/env python3
"""
Script para probar el health check localmente
"""
import requests
import time
import sys

def test_health_check(base_url="http://localhost:8000"):
    """Probar el health check"""
    print(f"🔍 Probando health check en: {base_url}")
    
    try:
        # Probar health check simple
        response = requests.get(f"{base_url}/health/", timeout=10)
        print(f"✅ Health check simple: {response.status_code}")
        print(f"   Respuesta: {response.json()}")
        
        # Probar health check detallado
        response_detailed = requests.get(f"{base_url}/health/detailed/", timeout=10)
        print(f"✅ Health check detallado: {response_detailed.status_code}")
        print(f"   Respuesta: {response_detailed.json()}")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print(f"❌ No se pudo conectar a {base_url}")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ Timeout al conectar a {base_url}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_admin(base_url="http://localhost:8000"):
    """Probar acceso al admin"""
    print(f"🔍 Probando admin en: {base_url}")
    
    try:
        response = requests.get(f"{base_url}/admin/", timeout=10)
        print(f"✅ Admin: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Error en admin: {e}")
        return False

def main():
    print("🚀 PRUEBA DE HEALTH CHECK")
    
    # Probar localmente
    print("\n📍 Probando localmente...")
    local_success = test_health_check()
    test_admin()
    
    # Probar en Railway (si se proporciona URL)
    if len(sys.argv) > 1:
        railway_url = sys.argv[1]
        print(f"\n📍 Probando en Railway: {railway_url}")
        railway_success = test_health_check(railway_url)
        test_admin(railway_url)
    else:
        print("\n💡 Para probar en Railway, ejecuta:")
        print("   python test-health.py https://tu-app.railway.app")
    
    print("\n✨ Prueba completada")

if __name__ == "__main__":
    main()
