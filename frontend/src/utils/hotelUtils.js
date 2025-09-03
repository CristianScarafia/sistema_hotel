// Utilidades del sistema hotel - Combinación de funciones de alerts.js, confirmations.js y planning.js

// Funciones de alertas
export const showAlert = (message, type = 'info') => {
  // Implementación de alertas usando react-toastify
  if (typeof window !== 'undefined' && window.toast) {
    window.toast[type](message);
  }
};

export const showSuccessAlert = (message) => {
  showAlert(message, 'success');
};

export const showErrorAlert = (message) => {
  showAlert(message, 'error');
};

export const showWarningAlert = (message) => {
  showAlert(message, 'warning');
};

// Funciones de confirmación
export const confirmAction = (message, onConfirm, onCancel) => {
  if (window.confirm(message)) {
    onConfirm();
  } else if (onCancel) {
    onCancel();
  }
};

export const confirmDelete = (itemName, onConfirm) => {
  confirmAction(
    `¿Estás seguro de que quieres eliminar ${itemName}?`,
    onConfirm
  );
};

// Funciones de planning
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('es-ES');
};

export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const calculateTotalPrice = (pricePerNight, nights) => {
  return pricePerNight * nights;
};

// Funciones de validación
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[+]?[1-9][\d]{0,15}$/;
  return re.test(phone);
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

// Funciones de formato de moneda
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount);
};

// Funciones de estado de habitaciones
export const getRoomStatusColor = (status) => {
  const colors = {
    'disponible': 'green',
    'ocupada': 'red',
    'mantenimiento': 'yellow',
    'reservada': 'blue'
  };
  return colors[status] || 'gray';
};

export const getRoomStatusText = (status) => {
  const texts = {
    'disponible': 'Disponible',
    'ocupada': 'Ocupada',
    'mantenimiento': 'Mantenimiento',
    'reservada': 'Reservada'
  };
  return texts[status] || 'Desconocido';
};

// Formateo de nombres a Título (convierte todo a minúsculas y capitaliza cada palabra)
export const toTitleCase = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ');
};