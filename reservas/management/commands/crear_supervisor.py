from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from reservas.models import PerfilUsuario


class Command(BaseCommand):
    help = 'Crea un usuario supervisor inicial'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='admin', help='Nombre de usuario')
        parser.add_argument('--email', type=str, default='admin@hotel.com', help='Email del usuario')
        parser.add_argument('--password', type=str, default='admin123', help='Contraseña del usuario')
        parser.add_argument('--first_name', type=str, default='Administrador', help='Nombre')
        parser.add_argument('--last_name', type=str, default='Sistema', help='Apellido')
        parser.add_argument('--turno', type=str, default='mañana', help='Turno (mañana/tarde/noche)')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']
        turno = options['turno']

        # Verificar si el usuario ya existe
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'El usuario {username} ya existe.')
            )
            return

        # Crear el usuario
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_superuser=True
        )

        # Crear el perfil de supervisor
        perfil = PerfilUsuario.objects.create(
            usuario=user,
            rol='supervisor',
            turno=turno
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Usuario supervisor creado exitosamente:\n'
                f'  Usuario: {username}\n'
                f'  Contraseña: {password}\n'
                f'  Rol: {perfil.get_rol_display()}\n'
                f'  Turno: {perfil.get_turno_display()}\n'
                f'  Email: {email}'
            )
        )
