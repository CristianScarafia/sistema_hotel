from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import PerfilUsuario


@receiver(post_save, sender=User)
def crear_perfil_usuario(sender, instance, created, **kwargs):
    """
    Signal para crear automáticamente un perfil de usuario
    cuando se crea un nuevo usuario
    """
    if created:
        PerfilUsuario.objects.create(
            usuario=instance,
            rol='conserge',  # Por defecto es conserje
            turno='mañana'   # Por defecto es mañana
        )


@receiver(post_save, sender=User)
def guardar_perfil_usuario(sender, instance, **kwargs):
    """
    Signal para guardar el perfil cuando se actualiza el usuario
    """
    if hasattr(instance, 'perfil'):
        instance.perfil.save()
