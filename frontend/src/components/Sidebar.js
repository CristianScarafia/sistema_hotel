import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaBed, 
  FaCalendarAlt, 
  FaUsers, 
  FaChartBar, 
  FaCog,
  FaHotel,
  FaSignInAlt,
  FaSignOutAlt,
  FaCalendarCheck,
  FaBroom
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Función para obtener el rol del usuario
  const getUserRole = () => {
    if (!user || !user.perfil) return 'conserge';
    return user.perfil.rol || 'conserge';
  };

  const isSupervisor = getUserRole() === 'supervisor';

  const menuItems = [
    { path: '/', icon: FaHome, label: 'Dashboard', exact: true, roles: ['conserge', 'supervisor'] },
    { path: '/reservas', icon: FaCalendarAlt, label: 'Reservas', roles: ['conserge', 'supervisor'] },
    { path: '/habitaciones', icon: FaBed, label: 'Habitaciones', roles: ['conserge', 'supervisor'] },
    { path: '/entradas-salidas', icon: FaSignInAlt, label: 'Entradas y Salidas', roles: ['conserge', 'supervisor'] },
    { path: '/planning', icon: FaCalendarCheck, label: 'Planning', roles: ['conserge', 'supervisor'] },
    { path: '/ocupacion-limpieza', icon: FaBroom, label: 'Ocupación y Limpieza', roles: ['conserge', 'supervisor'] },
    { path: '/usuarios', icon: FaUsers, label: 'Usuarios', roles: ['supervisor'] },
    { path: '/estadisticas', icon: FaChartBar, label: 'Estadísticas', roles: ['supervisor'] },
    { path: '/configuracion', icon: FaCog, label: 'Configuración', roles: ['supervisor'] },
  ];

  // Filtrar elementos del menú según el rol del usuario
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(getUserRole())
  );

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Logo Hotel" className="h-8 w-8" />
          <h1 className="text-xl font-bold">Sistema Hotel</h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path, item.exact)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          <p>© 2024 Sistema Hotel</p>
          <p className="text-xs mt-1">v1.0.0 - Diseñado y desarrollado por Cristian Scarafia</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
