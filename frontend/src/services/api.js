import axios from 'axios';

// Configurar axios
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir al login si no está autenticado
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios para Reservas
export const reservasService = {
  getAll: () => api.get('/reservas/'),
  getById: (id) => api.get(`/reservas/${id}/`),
  create: (data) => api.post('/reservas/', data),
  update: (id, data) => api.put(`/reservas/${id}/`, data),
  delete: (id) => api.delete(`/reservas/${id}/`),
  getHoy: () => api.get('/reservas/hoy/'),
  getCheckinsHoy: () => api.get('/reservas/checkins-hoy/'),
  getCheckoutsHoy: () => api.get('/reservas/checkouts-hoy/'),
  getPorFecha: (fecha) => api.get(`/reservas/por-fecha/?fecha=${fecha}`),
  getPorHabitacion: (habitacionId) => api.get(`/reservas/por-habitacion/?habitacion_id=${habitacionId}`),
};

// Servicios para Habitaciones
export const habitacionesService = {
  getAll: () => api.get('/habitaciones/'),
  getById: (id) => api.get(`/habitaciones/${id}/`),
  create: (data) => api.post('/habitaciones/', data),
  update: (id, data) => api.put(`/habitaciones/${id}/`, data),
  delete: (id) => api.delete(`/habitaciones/${id}/`),
  getDisponibles: () => api.get('/habitaciones/disponibles/'),
  getOcupadas: () => api.get('/habitaciones/ocupadas/'),
  getPorTipo: (tipo) => api.get(`/habitaciones/por-tipo/?tipo=${tipo}`),
};

// Servicios para Estadísticas
export const estadisticasService = {
  getEstadisticas: () => api.get('/estadisticas/'),
  getDashboard: () => api.get('/dashboard/'),
};

// Servicios de Autenticación
export const authService = {
  login: (credentials) => api.post('/auth/', credentials),
  logout: () => api.delete('/auth/'),
  getUser: () => api.get('/auth/'),
};

export default api;
