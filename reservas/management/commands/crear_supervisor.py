from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from reservas.models import PerfilUsuario


class Command(BaseCommand):
    help = "Crea un usuario supervisor inicial"

    def add_arguments(self, parser):
        parser.add_argument(
            "--username", type=str, default="admin", 
            help="Nombre de usuario"
        )
        parser.add_argument(
            "--email", type=str, default="admin@hotel.com", 
            help="Email del usuario"
        )
        parser.add_argument(
            "--password", type=str, default="admin123", 
            help="Contraseña del usuario"
        )
        parser.add_argument(
            "--first_name", type=str, default="Administrador", 
            help="Nombre"
        )
        parser.add_argument(
            "--last_name", type=str, default="Sistema", 
            help="Apellido"
        )
        parser.add_argument(
            "--turno", type=str, default="mañana", 
            help="Turno (mañana/tarde/noche)"
        )

    def handle(self, *args, **options):
        username = options["username"]
        email = options["email"]
        password = options["password"]
        first_name = options["first_name"]
        last_name = options["last_name"]
        turno = options["turno"]

        # Verificar si el usuario ya existe
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            # Verificar si ya tiene perfil
            if PerfilUsuario.objects.filter(usuario=user).exists():
                self.stdout.write(
                    self.style.WARNING(
                        f"El usuario {username} ya existe con perfil completo."
                    )
                )
                return
            else:
                # El usuario existe pero no tiene perfil, crearlo
                perfil = PerfilUsuario.objects.create(
                    usuario=user, rol="supervisor", turno=turno
                )
                mensaje = (
                    f"Perfil de supervisor creado para usuario existente:\n"
                    f"  Usuario: {username}\n"
                    f"  Rol: {perfil.get_rol_display()}\n"
                    f"  Turno: {perfil.get_turno_display()}"
                )
                self.stdout.write(self.style.SUCCESS(mensaje))
                return
        else:
            # El usuario existe pero no tiene perfil, crearlo
            perfil = PerfilUsuario.objects.create(
                usuario=user, rol="supervisor", turno=turno
            )
            mensaje = (
                f"Perfil de supervisor creado para usuario existente:\n"
                f"  Usuario: {username}\n"
                f"  Rol: {perfil.get_rol_display()}\n"
                f"  Turno: {perfil.get_turno_display()}"
            )
            self.stdout.write(self.style.SUCCESS(mensaje))
            return

        # Crear el usuario
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_superuser=True,
        )

        # Crear el perfil de supervisor
        perfil = PerfilUsuario.objects.create(
            usuario=user, rol="supervisor", turno=turno
        )
        
        # Verificar que el perfil se creó correctamente
        user.refresh_from_db()
        if hasattr(user, 'perfil') and user.perfil.es_supervisor():
            self.stdout.write(
                self.style.SUCCESS(
                    "✅ Perfil de supervisor verificado correctamente."
                )
            )
        else:
            self.stdout.write(
                self.style.ERROR(
                    "❌ Error: El perfil no se creó correctamente."
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Usuario supervisor creado exitosamente:\n"
                f"  Usuario: {username}\n"
                f"  Contraseña: {password}\n"
                f"  Rol: {perfil.get_rol_display()}\n"
                f"  Turno: {perfil.get_turno_display()}\n"
                f"  Email: {email}"
            )
        )
