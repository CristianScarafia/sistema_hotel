import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Create user profile if it does not exist"

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            type=str,
            help="Username to create profile for (default: admin)",
            default="admin",
        )

    def handle(self, *args, **options):
        username = options["username"]

        try:
            user = User.objects.get(username=username)

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
                        self.style.SUCCESS(f"Perfil creado para {username}")
                    )
                else:
                    # Actualizar rol si ya existe
                    perfil.rol = "supervisor"
                    perfil.save()
                    self.stdout.write(
                        self.style.SUCCESS(f"Perfil actualizado para {username}")
                    )

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creando perfil: {e}"))

        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Usuario {username} no existe"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {e}"))
