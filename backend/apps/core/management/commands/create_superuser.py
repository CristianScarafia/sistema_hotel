import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType

User = get_user_model()


class Command(BaseCommand):
    help = "Create a superuser with all permissions if it does not exist"

    def handle(self, *args, **options):
        username = os.environ.get("ADMIN_USERNAME", "admin")
        email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
        password = os.environ.get("ADMIN_PASSWORD", "admin123")

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.SUCCESS(f"Superuser {username} already exists")
            )
            return

        try:
            # Crear superusuario
            user = User.objects.create_superuser(
                username=username, email=email, password=password
            )

            # Asignar todos los permisos disponibles
            all_permissions = Permission.objects.all()
            user.user_permissions.set(all_permissions)

            # Crear perfil de usuario con rol supervisor
            try:
                from apps.reservas.models import PerfilUsuario

                perfil, created = PerfilUsuario.objects.get_or_create(
                    usuario=user,
                    defaults={
                        "rol": "supervisor",
                        "turno": "mañana",
                        "telefono": "123456789",
                        "direccion": "Dirección del administrador",
                    },
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f"Perfil de usuario creado para {username}")
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(f"No se pudo crear el perfil: {e}")
                )

            self.stdout.write(
                self.style.SUCCESS(
                    f"Superuser creado exitosamente con todos los permisos: {username}/{password}"
                )
            )
            self.stdout.write(self.style.SUCCESS(f"Rol asignado: supervisor"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error creating superuser: {e}"))
