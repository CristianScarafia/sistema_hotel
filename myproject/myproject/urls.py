from django.contrib import admin
from django.urls import include, path
from reservas.views import home

urlpatterns = [
    path('admin/', admin.site.urls),
    path('reservas/', include('reservas.urls')),
    path('', home, name='home'),
    path('__debug__/', include('debug_toolbar.urls')),
]