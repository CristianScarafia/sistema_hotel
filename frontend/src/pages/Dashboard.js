import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { estadisticasService } from '../services/api';
import { FaBed, FaUsers, FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';
import { formatCurrency, formatDate, toTitleCase } from '../utils/hotelUtils';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [estadisticasRes, dashboardRes] = await Promise.all([
        estadisticasService.getEstadisticas(),
        estadisticasService.getDashboard()
      ]);
      
      setEstadisticas(estadisticasRes.data);
      setDashboard(dashboardRes.data);
    } catch (error) {
      toast.error('Error al cargar los datos del dashboard');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-1">
        <h1 className="text-3xl font-bold text-gray-900 text-left">Dashboard</h1>
        <div className="text-xs sm:text-sm text-gray-500">
          Última actualización: {new Date().toLocaleString()}
        </div>
      </div>
      
      {/* Estadísticas Principales */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaBed className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Habitaciones</p>
                <p className="text-2xl font-semibold text-gray-900">{estadisticas.total_habitaciones}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaUsers className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Habitaciones Disponibles</p>
                <p className="text-2xl font-semibold text-gray-900">{estadisticas.habitaciones_disponibles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaCalendarCheck className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Check-ins Hoy</p>
                <p className="text-2xl font-semibold text-gray-900">{estadisticas.reservas_hoy}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FaCalendarTimes className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Check-outs Hoy</p>
                <p className="text-2xl font-semibold text-gray-900">{estadisticas.checkouts_hoy}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ingresos Totales - solo supervisores */}
      {estadisticas && user?.perfil?.rol === 'supervisor' && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Ingresos Totales</h3>
              <p className="text-sm text-gray-600">Total acumulado de todas las reservas</p>
            </div>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-green-600">
                {formatCurrency(estadisticas.ingresos_totales)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Últimas Reservas */}
      {dashboard && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Últimas Reservas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número de reserva
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Habitación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboard.ultimas_reservas.map((reserva) => (
                  <tr key={reserva.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reserva.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {toTitleCase(reserva.nombre_completo)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reserva.habitacion_numero} - {reserva.habitacion_tipo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(reserva.fecha_ingreso)} - {formatDate(reserva.fecha_egreso)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(reserva.monto_total)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
