// Funciones para manejar confirmaciones de eliminación
function confirmDelete(url, message = '¿Estás seguro de que deseas eliminar este elemento?') {
    if (confirm(message)) {
        // Crear un formulario temporal para enviar la solicitud POST
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        
        // Agregar el token CSRF
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfmiddlewaretoken';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);
        
        // Agregar el formulario al DOM y enviarlo
        document.body.appendChild(form);
        form.submit();
    }
}

// Función para confirmar eliminación de habitación
function confirmDeleteHabitacion(habitacionId, numeroHabitacion) {
    const message = `¿Estás seguro de que deseas eliminar la habitación ${numeroHabitacion}?`;
    const url = `/eliminar_habitacion/${habitacionId}/`;
    confirmDelete(url, message);
}

// Función para confirmar eliminación de reserva
function confirmDeleteReserva(reservaId, nombreReserva) {
    const message = `¿Estás seguro de que deseas eliminar la reserva de ${nombreReserva}?`;
    const url = `/eliminar_reserva/${reservaId}/`;
    confirmDelete(url, message);
}

// Función para mostrar un diálogo de confirmación personalizado
function showConfirmDialog(title, message, onConfirm, onCancel) {
    // Crear el overlay
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    // Crear el diálogo
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        text-align: center;
    `;

    // Contenido del diálogo
    dialog.innerHTML = `
        <div class="mb-4">
            <svg class="w-12 h-12 mx-auto text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">${title}</h3>
        <p class="text-gray-600 mb-6">${message}</p>
        <div class="flex gap-3 justify-center">
            <button class="btn-cancel px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
                Cancelar
            </button>
            <button class="btn-confirm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Eliminar
            </button>
        </div>
    `;

    // Agregar al DOM
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Event listeners
    const cancelBtn = dialog.querySelector('.btn-cancel');
    const confirmBtn = dialog.querySelector('.btn-confirm');

    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        if (onCancel) onCancel();
    });

    confirmBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        if (onConfirm) onConfirm();
    });

    // Cerrar al hacer clic en el overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
            if (onCancel) onCancel();
        }
    });

    // Cerrar con Escape
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(overlay);
            document.removeEventListener('keydown', handleEscape);
            if (onCancel) onCancel();
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Función para confirmar eliminación con diálogo personalizado
function confirmDeleteWithDialog(url, title, message) {
    showConfirmDialog(title, message, () => {
        // Crear un formulario temporal para enviar la solicitud POST
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        
        // Agregar el token CSRF
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfmiddlewaretoken';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);
        
        // Agregar el formulario al DOM y enviarlo
        document.body.appendChild(form);
        form.submit();
    });
}
