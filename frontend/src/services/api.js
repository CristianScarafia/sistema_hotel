import axios from 'axios';

// Configurar axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
});

// Interceptor para manejar CSRF
api.interceptors.request.use(
  (config) => {
    // Obtener el token CSRF de las cookies
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

// Servicios de reservas
export const reservasService = {
  getAll: () => api.get('/reservas/'),
  getById: (id) => api.get(`/reservas/${id}/`),
  create: (data) => api.post('/reservas/', data),
  update: (id, data) => api.put(`/reservas/${id}/`, data),
  delete: (id) => api.delete(`/reservas/${id}/`),
  getHoy: () => api.get('/reservas/hoy/'),
  getReservasPorFecha: (fecha) => api.get(`/reservas/por_fecha/?fecha=${fecha}`).then(response => response.data),
  getLimpieza: (fecha) => api.get(`/reservas/limpieza/?fecha=${fecha}`).then(response => response.data),
};

// Servicios de habitaciones
export const habitacionesService = {
  getAll: () => api.get('/habitaciones/'),
  getById: (id) => api.get(`/habitaciones/${id}/`),
  create: (data) => api.post('/habitaciones/', data),
  update: (id, data) => api.put(`/habitaciones/${id}/`, data),
  delete: (id) => api.delete(`/habitaciones/${id}/`),
};

// Servicios de planning
export const planningService = {
  getPlanning: (startDate) => api.get(`/planning/planning/?start_date=${startDate}`),
};

// Servicios de usuarios
export const usuariosService = {
  getAll: () => api.get('/usuarios/'),
  getById: (id) => api.get(`/usuarios/${id}/`),
  create: (data) => api.post('/usuarios/', data),
  update: (id, data) => api.put(`/usuarios/${id}/`, data),
  delete: (id) => api.delete(`/usuarios/${id}/`),
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
