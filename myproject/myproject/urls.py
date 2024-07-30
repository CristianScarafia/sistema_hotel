from django.contrib import admin
from django.urls import include, path
from reservas.views import home
from reservas import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('reservas/', include('reservas.urls')),
    path('', home, name='home'),
    path('__debug__/', include('debug_toolbar.urls')),
    path('update_checkins_checkouts/', views.update_checkins_checkouts, name='update_checkins_checkouts'),
]