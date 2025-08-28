import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission

User = get_user_model()


class Command(BaseCommand):
    help = "Assign supervisor permissions to existing users"

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            type=str,
            help="Username to assign permissions to (default: admin)",
            default="admin",
        )

    def handle(self, *args, **options):
        username = options["username"]

        try:
            user = User.objects.get(username=username)

            # Asignar todos los permisos disponibles
            all_permissions = Permission.objects.all()
            user.user_permissions.set(all_permissions)

            # Crear o actualizar perfil de usuario
            try:
                from apps.reservas.models import PerfilUsuario

                perfil, created = PerfilUsuario.objects.get_or_create(
                    usuario=user,
                    defaults={
                        "rol": "supervisor",
                        "turno": "mañana",
                        "telefono": "123456789",
                        "direccion": "Dirección del supervisor",
                    },
                )

                if not created:
                    # Actualizar rol si ya existe
                    perfil.rol = "supervisor"
                    perfil.save()
                    self.stdout.write(
                        self.style.SUCCESS(f"Perfil actualizado para {username}")
                    )
                else:
                    self.stdout.write(
                        self.style.SUCCESS(f"Perfil creado para {username}")
                    )

            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(f"No se pudo crear/actualizar el perfil: {e}")
                )

            self.stdout.write(
                self.style.SUCCESS(
                    f"Permisos de supervisor asignados exitosamente a {username}"
                )
            )

        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Usuario {username} no existe"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error asignando permisos: {e}"))
