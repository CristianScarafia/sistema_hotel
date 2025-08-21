#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings.development")
django.setup()

from django.contrib.auth.models import User
from reservas.models import PerfilUsuario


def test_usuarios():
    print("=== PRUEBA DE USUARIOS ===")

    # Verificar usuarios en auth_user
    usuarios = User.objects.all()
    print(f"Total de usuarios en auth_user: {usuarios.count()}")

    for usuario in usuarios:
        print(f"- Usuario: {usuario.username} (ID: {usuario.id})")
        print(f"  Nombre: {usuario.first_name} {usuario.last_name}")
        print(f"  Email: {usuario.email}")
        print(f"  Activo: {usuario.is_active}")

        # Verificar perfil
        try:
            perfil = usuario.perfil
            print(f"  Rol: {perfil.rol}")
            print(f"  Turno: {perfil.turno}")
        except PerfilUsuario.DoesNotExist:
            print(f"  ⚠️  NO TIENE PERFIL")
        print()

    # Verificar perfiles
    perfiles = PerfilUsuario.objects.all()
    print(f"Total de perfiles: {perfiles.count()}")

    for perfil in perfiles:
        print(f"- Perfil para usuario: {perfil.usuario.username}")
        print(f"  Rol: {perfil.rol}")
        print(f"  Turno: {perfil.turno}")
        print()


if __name__ == "__main__":
    test_usuarios()
