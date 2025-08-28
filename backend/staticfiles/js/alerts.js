// Sistema de alertas mejorado para el sistema de hotel
(function() {
    'use strict';

    // Configuración global de Toastr
    if (typeof toastr !== 'undefined') {
        toastr.options = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": true,
            "progressBar": true,
            "positionClass": "toast-top-right",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };
    }

    // Función para mostrar alertas
    function showAlert(message, type = 'info') {
        if (typeof toastr !== 'undefined') {
            switch(type) {
                case 'success':
                    toastr.success(message);
                    break;
                case 'error':
                    toastr.error(message);
                    break;
                case 'warning':
                    toastr.warning(message);
                    break;
                case 'info':
                default:
                    toastr.info(message);
                    break;
            }
        } else {
            // Fallback a alert nativo si Toastr no está disponible
            alert(message);
        }
    }

    // Función para procesar mensajes de Django
    function processDjangoMessages() {
        const messageElements = document.querySelectorAll('[data-message]');
        messageElements.forEach(function(element) {
            const message = element.getAttribute('data-message');
            const type = element.getAttribute('data-type') || 'info';
            showAlert(message, type);
            element.remove(); // Remover el elemento después de mostrar el mensaje
        });
    }

    // Función para verificar si Toastr está disponible
    function checkToastrAvailability() {
        if (typeof toastr !== 'undefined') {
            console.log('✅ Toastr está disponible');
            return true;
        } else {
            console.error('❌ Toastr no está disponible');
            return false;
        }
    }

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // Verificar disponibilidad de Toastr
        checkToastrAvailability();
        
        // Procesar mensajes de Django
        processDjangoMessages();
        
        // Configurar listeners para formularios
        setupFormListeners();
    });

    // Configurar listeners para formularios
    function setupFormListeners() {
        const forms = document.querySelectorAll('form');
        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                // Mostrar indicador de carga si es necesario
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Procesando...';
                }
            });
        });
    }

    // Exponer funciones globalmente
    window.HotelAlerts = {
        show: showAlert,
        checkToastr: checkToastrAvailability,
        processMessages: processDjangoMessages
    };

})();
