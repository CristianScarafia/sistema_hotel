from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.reservas.models import PerfilUsuario

class Command(BaseCommand):
    help = 'Crear perfiles de usuario por defecto para usuarios que no los tengan'

    def handle(self, *args, **options):
        users_without_profile = User.objects.filter(perfil__isnull=True)
        
        created_count = 0
        for user in users_without_profile:
            # Crear perfil por defecto
            perfil = PerfilUsuario.objects.create(
                usuario=user,
                rol='supervisor' if user.is_superuser else 'conserge',
                turno='mañana',
                activo=True
            )
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(
                    f'Perfil creado para {user.username} con rol {perfil.rol}'
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Se crearon {created_count} perfiles de usuario'
            )
        )
