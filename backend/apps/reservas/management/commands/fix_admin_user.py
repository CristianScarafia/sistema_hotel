from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.reservas.models import PerfilUsuario


class Command(BaseCommand):
    help = "Verificar y corregir el usuario admin"

    def handle(self, *args, **options):
        try:
            # Buscar el usuario admin
            admin_user = User.objects.get(username="admin")

            self.stdout.write(f"Usuario encontrado: {admin_user.username}")
            self.stdout.write(f"is_staff: {admin_user.is_staff}")
            self.stdout.write(f"is_superuser: {admin_user.is_superuser}")
            self.stdout.write(f"is_active: {admin_user.is_active}")

            # Verificar si tiene perfil
            try:
                perfil = PerfilUsuario.objects.get(usuario=admin_user)
                self.stdout.write(f"Perfil encontrado: {perfil.rol}")
            except PerfilUsuario.DoesNotExist:
                self.stdout.write("No tiene perfil, creando uno...")
                perfil = PerfilUsuario.objects.create(
                    usuario=admin_user, rol="supervisor", turno="mañana", activo=True
                )
                self.stdout.write(f"Perfil creado: {perfil.rol}")

            # Asegurar que sea superusuario y staff
            if not admin_user.is_superuser:
                admin_user.is_superuser = True
                self.stdout.write("Marcando como superusuario...")

            if not admin_user.is_staff:
                admin_user.is_staff = True
                self.stdout.write("Marcando como staff...")

            if not admin_user.is_active:
                admin_user.is_active = True
                self.stdout.write("Marcando como activo...")

            admin_user.save()

            self.stdout.write(
                self.style.SUCCESS(
                    f"Usuario admin configurado correctamente:\n"
                    f"- is_staff: {admin_user.is_staff}\n"
                    f"- is_superuser: {admin_user.is_superuser}\n"
                    f"- is_active: {admin_user.is_active}\n"
                    f"- Rol en perfil: {perfil.rol}"
                )
            )

        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR("Usuario admin no encontrado"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {e}"))
