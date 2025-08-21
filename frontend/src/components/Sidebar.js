import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaBed, 
  FaCalendarAlt, 
  FaUsers, 
  FaChartBar, 
  FaCog,
  FaHotel
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: FaHome, label: 'Dashboard', exact: true },
    { path: '/reservas', icon: FaCalendarAlt, label: 'Reservas' },
    { path: '/habitaciones', icon: FaBed, label: 'Habitaciones' },
    { path: '/usuarios', icon: FaUsers, label: 'Usuarios' },
    { path: '/estadisticas', icon: FaChartBar, label: 'Estadísticas' },
    { path: '/configuracion', icon: FaCog, label: 'Configuración' },
  ];

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
          {menuItems.map((item) => {
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
          <p className="text-xs mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
