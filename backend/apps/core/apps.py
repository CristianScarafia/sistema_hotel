from django.apps import AppConfig


def _bootstrap_admin_with_retries(
    max_retries: int = 5, delay_seconds: float = 2.0
) -> None:
    """Asegura que el usuario admin exista y tenga permisos de supervisor.

    Se reintenta algunas veces por si la base aún no está lista al iniciar.
    """
    import os
    import time
    from django.db import OperationalError
    from django.contrib.auth import get_user_model

    User = get_user_model()

    username = os.environ.get("ADMIN_USERNAME", "admin")
    email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    password = os.environ.get("ADMIN_PASSWORD", "admin123")

    for attempt in range(1, max_retries + 1):
        try:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                },
            )

            if created:
                user.set_password(password)
            # Asegurar flags de admin
            if not user.is_staff:
                user.is_staff = True
            if not user.is_superuser:
                user.is_superuser = True
            if not user.is_active:
                user.is_active = True
            user.save()

            # Asegurar perfil de usuario como supervisor
            try:
                from apps.reservas.models import PerfilUsuario

                PerfilUsuario.objects.get_or_create(
                    usuario=user,
                    defaults={"rol": "supervisor", "turno": "mañana", "activo": True},
                )
            except Exception:
                # Si falla la importación o la tabla aún no existe, se ignora en este intento
                pass

            return  # Éxito
        except OperationalError:
            if attempt == max_retries:
                return
            time.sleep(delay_seconds)
        except Exception:
            # No interrumpir el arranque de la app por esto
            return


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core"

    def ready(self) -> None:
        # Permitir desactivar vía variable de entorno si es necesario
        import os

        if os.environ.get("AUTO_FIX_ADMIN", "true").lower() != "true":
            return

        # Ejecutar en hilo aparte para no bloquear el arranque
        try:
            import threading

            threading.Thread(
                target=_bootstrap_admin_with_retries,
                kwargs={"max_retries": 8, "delay_seconds": 1.5},
                daemon=True,
            ).start()
        except Exception:
            # No detener la app si esto falla
            pass
