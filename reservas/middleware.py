from django.conf import settings
from django.shortcuts import redirect
from django.contrib import messages
from django.utils.deprecation import MiddlewareMixin


class LoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.user.is_authenticated and request.path != settings.LOGIN_URL:
            return redirect(settings.LOGIN_URL)
        response = self.get_response(request)
        return response


class AlertMiddleware(MiddlewareMixin):
    """
    Middleware para asegurar que las alertas funcionen correctamente
    """

    def process_response(self, request, response):
        # Asegurar que los mensajes estén disponibles en el contexto
        if hasattr(request, "_messages"):
            # Los mensajes ya están configurados
            pass
        return response
