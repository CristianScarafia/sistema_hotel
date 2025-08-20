from django import forms
from .models import Habitacion, Reserva
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class HabitacionForm(forms.ModelForm):
    class Meta:
        model = Habitacion
        fields = ["numero", "tipo", "piso"]
        widgets = {
            "tipo": forms.Select(
                choices=[
                    ("doble", "Doble"),
                    ("triple", "Triple"),
                    ("cuadruple", "Cuádruple"),
                    ("quintuple", "Quíntuple"),
                ]
            ),
            "piso": forms.Select(
                choices=[
                    ("planta baja", "Planta Baja"),
                    ("primer piso", "Primer Piso"),
                    ("segundo piso", "Segundo Piso"),
                ]
            ),
        }


class ReservaForm(forms.ModelForm):
    ENCARGADO_CHOICES = [
        ("Leandro", "Leandro"),
        ("Cristian", "Cristian"),
        ("Carlos PM", "Carlos PM"),
        ("Carlos AM", "Carlos AM"),
        ("Otro", "Otro"),
    ]

    encargado = forms.ChoiceField(choices=ENCARGADO_CHOICES, required=True)

    class Meta:
        model = Reserva
        fields = [
            "encargado",
            "nhabitacion",
            "nombre",
            "apellido",
            "personas",
            "fecha_ingreso",
            "fecha_egreso",
            "monto_total",
            "senia",
            "cantidad_habitaciones",
            "telefono",
            "celiacos",
            "observaciones",
            "origen",
        ]
        widgets = {
            "fecha_ingreso": forms.DateInput(attrs={"type": "date"}),
            "fecha_egreso": forms.DateInput(attrs={"type": "date"}),
            "observaciones": forms.Textarea(
                attrs={"rows": 1, "style": "height: 40px;"}
            ),
        }


class UsuarioForm(UserCreationForm):
    # Personalizar etiquetas en español
    username = forms.CharField(
        label="Nombre de Usuario",
        widget=forms.TextInput(
            attrs={
                "class": "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "placeholder": "Ingrese un nombre de usuario único",
            }
        ),
    )
    first_name = forms.CharField(
        label="Nombre",
        widget=forms.TextInput(
            attrs={
                "class": "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "placeholder": "Ingrese el nombre",
            }
        ),
    )
    last_name = forms.CharField(
        label="Apellido",
        widget=forms.TextInput(
            attrs={
                "class": "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "placeholder": "Ingrese el apellido",
            }
        ),
    )
    email = forms.EmailField(
        label="Correo Electrónico",
        widget=forms.EmailInput(
            attrs={
                "class": "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "placeholder": "ejemplo@correo.com",
            }
        ),
    )
    password1 = forms.CharField(
        label="Contraseña",
        widget=forms.PasswordInput(
            attrs={
                "class": "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "placeholder": "Ingrese una contraseña segura",
            }
        ),
    )
    password2 = forms.CharField(
        label="Confirmar Contraseña",
        widget=forms.PasswordInput(
            attrs={
                "class": "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "placeholder": "Confirme la contraseña",
            }
        ),
    )

    # Campos adicionales para el perfil
    rol = forms.ChoiceField(
        label="Rol",
        choices=[
            ("conserge", "Conserje"),
            ("supervisor", "Supervisor"),
        ],
        widget=forms.Select(
            attrs={
                "class": "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            }
        ),
    )

    turno = forms.ChoiceField(
        label="Turno",
        choices=[
            ("mañana", "Mañana"),
            ("tarde", "Tarde"),
            ("noche", "Noche"),
        ],
        widget=forms.Select(
            attrs={
                "class": "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            }
        ),
    )

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "password1",
            "password2",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Personalizar mensajes de ayuda
        self.fields[
            "password1"
        ].help_text = """
        <ul class="text-sm text-gray-600 mt-1">
            <li>• Su contraseña debe contener al menos 8 caracteres</li>
            <li>• No puede ser muy común</li>
            <li>• No puede ser completamente numérica</li>
        </ul>
        """
        self.fields["password2"].help_text = (
            "Ingrese la misma contraseña para verificar."
        )
