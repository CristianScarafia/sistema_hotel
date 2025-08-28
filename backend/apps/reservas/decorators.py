from django.shortcuts import redirect
from django.contrib import messages
from functools import wraps
from .models import PerfilUsuario


def supervisor_required(view_func):
    """
    Decorador para verificar que el usuario sea supervisor.
    Si no es supervisor, redirige al home con un mensaje de error.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, "Debe iniciar sesión para acceder a esta función.")
            return redirect('login')
        
        # Verificar si el usuario tiene perfil y es supervisor
        try:
            if request.user.perfil.es_supervisor():
                return view_func(request, *args, **kwargs)
            else:
                messages.error(
                    request, 
                    "Acceso denegado. Solo los supervisores pueden acceder a esta función."
                )
                return redirect('home')
        except PerfilUsuario.DoesNotExist:
            messages.error(
                request, 
                "Acceso denegado. Su perfil de usuario no está configurado correctamente."
            )
            return redirect('home')
    
    return _wrapped_view
