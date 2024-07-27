from django import forms
from .models import Habitacion, Reserva

class HabitacionForm(forms.ModelForm):
    class Meta:
        model = Habitacion
        fields = ['numero', 'tipo', 'piso']
        widgets = {
            'tipo': forms.Select(choices=[
                ('doble', 'Doble'),
                ('triple', 'Triple'),
                ('cuadruple', 'Cuádruple'),
                ('quintuple', 'Quíntuple'),
            ]),
            'piso': forms.Select(choices=[
                ('planta baja', 'Planta Baja'),
                ('primer piso', 'Primer Piso'),
                ('segundo piso', 'Segundo Piso'),
            ]),
        }

class ReservaForm(forms.ModelForm):
    ENCARGADO_CHOICES = [
        ('Leandro', 'Leandro'),
        ('Cristian', 'Cristian'),
        ('Carlos PM', 'Carlos PM'),
        ('Carlos AM', 'Carlos AM'),
        ('Otro', 'Otro'),
    ]
    
    encargado = forms.ChoiceField(choices=ENCARGADO_CHOICES, required=True)

    class Meta:
        model = Reserva
        fields = [
            'encargado', 'nhabitacion', 'nombre', 'apellido', 'personas', 'fecha_ingreso', 
            'fecha_egreso', 'monto_total', 'senia', 'cantidad_habitaciones', 'telefono', 
            'celiacos', 'observaciones', 'origen'
        ]
        widgets = {
            'fecha_ingreso': forms.DateInput(attrs={'type': 'date'}),
            'fecha_egreso': forms.DateInput(attrs={'type': 'date'}),
            'observaciones': forms.Textarea(attrs={'rows': 1, 'style': 'height: 40px;'}),
        }