import axios from 'axios';

// Configurar axios con URL del backend desde variables de entorno
const getApiUrl = () => {
  // En Railway, usar la variable de entorno REACT_APP_API_URL
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // En desarrollo local
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000/api';
  }
  
  // Fallback por defecto
  return '/api';
};

// Configurar axios globalmente para CSRF
axios.defaults.baseURL = getApiUrl();
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

// Almacén en memoria para el token CSRF (útil en cross-site)
let csrfTokenValue = null;

export const setCsrfToken = (token) => {
  csrfTokenValue = token || null;
  if (csrfTokenValue) {
    api.defaults.headers.common['X-CSRFToken'] = csrfTokenValue;
    axios.defaults.headers.common['X-CSRFToken'] = csrfTokenValue;
  } else {
    delete api.defaults.headers.common['X-CSRFToken'];
    delete axios.defaults.headers.common['X-CSRFToken'];
  }
};

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
});

// Interceptor para adjuntar CSRF desde memoria si está disponible
api.interceptors.request.use(
  (config) => {
    if (csrfTokenValue) {
      config.headers['X-CSRFToken'] = csrfTokenValue;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Evitar redirecciones automáticas que causan bucles de recarga.
    // El manejo de 401 se realiza en rutas protegidas y AuthContext.
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
  importar: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/reservas/importar/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getVoucherUrl: (id) => `${getApiUrl()}/reservas/${id}/voucher/`,
  getVoucherMultiUrl: (ids) => `${getApiUrl()}/reservas/voucher-multi/?ids=${ids.join(',')}`,
};

// Servicios de habitaciones
export const habitacionesService = {
  getAll: () => api.get('/habitaciones/'),
  getById: (id) => api.get(`/habitaciones/${id}/`),
  create: (data) => api.post('/habitaciones/', data),
  update: (id, data) => api.put(`/habitaciones/${id}/`, data),
  delete: (id) => api.delete(`/habitaciones/${id}/`),
  getDisponibles: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/habitaciones/disponibles/${query ? `?${query}` : ''}`);
  },
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
  getKpis: (params = {}) => {
    const search = new URLSearchParams(params).toString();
    return api.get(`/estadisticas/kpis/${search ? `?${search}` : ''}`);
  },
};

// Servicios de Autenticación
export const authService = {
  login: (credentials) => api.post('/auth/', credentials),
  logout: () => api.delete('/auth/'),
  getUser: () => api.get('/auth/'),
};

export default api;
