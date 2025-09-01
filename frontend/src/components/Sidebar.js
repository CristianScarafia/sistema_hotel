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
  FaSignInAlt,
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

  // const isSupervisor = getUserRole() === 'supervisor';

  const menuItems = [
    { path: '/', icon: FaHome, label: 'Dashboard', exact: true, roles: ['conserge', 'supervisor'] },
    { path: '/reservas', icon: FaCalendarAlt, label: 'Reservas', roles: ['conserge', 'supervisor'] },
    { path: '/habitaciones', icon: FaBed, label: 'Habitaciones', roles: ['conserge', 'supervisor'] },
    { path: '/entradas-salidas', icon: FaSignInAlt, label: 'Entradas y Salidas', roles: ['conserge', 'supervisor'] },
    { path: '/planning', icon: FaCalendarCheck, label: 'Disponibilidad', roles: ['conserge', 'supervisor'] },
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
    <div className="relative w-64 min-h-screen flex flex-col text-white bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-900 border-r border-white/10 shadow-xl">
      {/* Accento superior sutil */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Logo Hotel"
            className="h-11 w-auto object-contain max-h-11 transition-transform duration-300 ease-out hover:scale-105"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl overflow-hidden transition-all duration-300 ring-1 ring-white/5 hover:ring-white/15 ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {/* Indicador lateral */}
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-opacity duration-300 ${
                      active ? 'bg-white/90 opacity-100' : 'bg-white/20 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                  {/* Brillo sutil en hover */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-0" />

                  <Icon className="h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:scale-110" />
                  <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-sm text-gray-400">
          <p>© 2024 Sistema Hotel</p>
          <p className="text-xs mt-1 opacity-75">v1.0.0 - Diseñado y desarrollado por Cristian Scarafia</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
