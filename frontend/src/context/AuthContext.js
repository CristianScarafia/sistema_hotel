import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

// Helper para obtener la URL base de la API
const getApiUrl = () => {
  // En Railway, usar la variable de entorno REACT_APP_API_URL
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace('/api', ''); // Remover /api para que sea la base URL
  }
  
  // En desarrollo local
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  
  // Fallback por defecto
  return '';
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Instancia estable de axios con interceptor CSRF
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: getApiUrl(),
      withCredentials: true,
    });
    instance.interceptors.request.use(
      (config) => {
        const csrfToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('csrftoken='))
          ?.split('=')[1];
        if (csrfToken) {
          config.headers['X-CSRFToken'] = csrfToken;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    return instance;
  }, []);

  const getUserProfile = useCallback(async (userData) => {
    try {
      const profileResponse = await api.get('/api/perfiles/mi_perfil/');
      return {
        ...userData,
        perfil: profileResponse.data
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {
        ...userData,
        perfil: { 
          rol: (userData.is_superuser || userData.is_staff) ? 'supervisor' : 'conserge', 
          turno: 'mañana',
          telefono: '123456789',
          direccion: 'Dirección del administrador'
        }
      };
    }
  }, [api]);

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('=== CHECKING AUTH STATUS ===');
      const response = await api.get('/api/auth/');
      console.log('Auth response:', response.data);
      // Obtener información del perfil del usuario
      const userWithProfile = await getUserProfile(response.data);
      console.log('User with profile:', userWithProfile);
      setUser(userWithProfile);
    } catch (error) {
      console.error('Error checking auth status:', error);
      console.error('Error details:', error.response?.data);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [api, getUserProfile]);

  useEffect(() => {
    // Primero pedir el token CSRF para que Django setee la cookie en dominios cruzados
    (async () => {
      try {
        await api.get('/api/csrf/');
      } catch (e) {
        console.warn('No se pudo obtener CSRF inicialmente:', e.response?.data || e.message);
      } finally {
        checkAuthStatus();
      }
    })();
  }, [api, checkAuthStatus]);

  const login = async (credentials) => {
    try {
      console.log('Attempting login with:', credentials);
      const response = await api.post('/api/auth/', credentials);
      console.log('Login response:', response.data);
      // Obtener información del perfil del usuario
      const userWithProfile = await getUserProfile(response.data.user);
      setUser(userWithProfile);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.detail || 'Error de autenticación' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.delete('/api/auth/');
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
