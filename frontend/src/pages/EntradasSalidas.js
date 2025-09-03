import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { reservasService } from '../services/api';
import { FaSignInAlt, FaSignOutAlt, FaCalendarAlt, FaUser, FaBed, FaPhone, FaMoneyBillWave } from 'react-icons/fa';
import { toTitleCase } from '../utils/hotelUtils';

const EntradasSalidas = () => {
  // Función auxiliar para crear fechas de manera segura
  const createSafeDate = (dateString) => {
    if (!dateString) return new Date();
    
    // Si ya es un objeto Date, devolverlo
    if (dateString instanceof Date) return dateString;
    
    // Si es una cadena de fecha en formato YYYY-MM-DD
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    
    // Para otros formatos, usar el constructor normal
    return new Date(dateString);
  };

  // Crear la fecha de hoy de manera segura para evitar problemas de zona horaria
  const today = new Date();
  const todayString = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
  
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [entradas, setEntradas] = useState([]);
  const [salidas, setSalidas] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadEntradasSalidas = useCallback(async () => {
    try {
      setLoading(true);
      // Obtener reservas del día seleccionado usando endpoint por fecha
      const data = await reservasService.getReservasPorFecha(selectedDate);
      const entradasFiltradas = Array.isArray(data?.entradas) ? data.entradas : [];
      const salidasFiltradas = Array.isArray(data?.salidas) ? data.salidas : [];

      setEntradas(entradasFiltradas);
      setSalidas(salidasFiltradas);
    } catch (error) {
      console.error('Error al cargar entradas y salidas:', error);
      toast.error('Error al cargar los datos');
      setEntradas([]);
      setSalidas([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadEntradasSalidas();
  }, [selectedDate, loadEntradasSalidas]);

  const formatDate = (dateString) => {
    const date = createSafeDate(dateString);
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    // Para fechas sin hora específica, mostrar "Sin hora específica"
    if (!dateString.includes('T')) {
      return 'Sin hora específica';
    }
    
    const date = createSafeDate(dateString);
    
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleRefresh = () => {
    loadEntradasSalidas();
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entradas y Salidas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los check-ins y check-outs del hotel
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <FaCalendarAlt className="h-4 w-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Selector de fecha */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-gray-700 font-medium">
            <FaCalendarAlt className="h-5 w-5 text-blue-600" />
            <span>Seleccionar fecha:</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-lg font-semibold text-gray-800">
            {formatDate(selectedDate)}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entradas (Check-ins) */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
            <div className="flex items-center space-x-3">
              <FaSignInAlt className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-green-800">Entradas (Check-ins)</h2>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                {entradas.length}
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {entradas.length > 0 ? (
              entradas.map((reserva) => (
                <div key={reserva.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <FaUser className="h-4 w-4 text-gray-400" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {toTitleCase(reserva.nombre_completo || `${reserva.nombre} ${reserva.apellido}`)}
                          </h3>
                          <div className="text-xs text-gray-500">Número de reserva: {reserva.id}</div>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <FaBed className="h-3 w-3" />
                              <span>Habitación {reserva.habitacion_numero || 'N/A'}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaPhone className="h-3 w-3" />
                              <span>{reserva.telefono}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaMoneyBillWave className="h-3 w-3" />
                              <span>${parseFloat(reserva.monto_total).toLocaleString()}</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>👥 {reserva.personas} persona{reserva.personas !== 1 ? 's' : ''}</span>
                            <span>📅 {reserva.noches} noche{reserva.noches !== 1 ? 's' : ''}</span>
                            <span>📍 {reserva.origen}</span>
                          </div>
                          {reserva.observaciones && (
                            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              <strong>Observaciones:</strong> {reserva.observaciones}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        Check-in
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(reserva.fecha_ingreso)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <FaSignInAlt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay entradas</h3>
                <p className="text-gray-500">No hay check-ins programados para esta fecha.</p>
              </div>
            )}
          </div>
        </div>

        {/* Salidas (Check-outs) */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <FaSignOutAlt className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-red-800">Salidas (Check-outs)</h2>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                {salidas.length}
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {salidas.length > 0 ? (
              salidas.map((reserva) => (
                <div key={reserva.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <FaUser className="h-4 w-4 text-gray-400" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {toTitleCase(reserva.nombre_completo || `${reserva.nombre} ${reserva.apellido}`)}
                          </h3>
                          <div className="text-xs text-gray-500">Número de reserva: {reserva.id}</div>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <FaBed className="h-3 w-3" />
                              <span>Habitación {reserva.habitacion_numero || 'N/A'}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaPhone className="h-3 w-3" />
                              <span>{reserva.telefono}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaMoneyBillWave className="h-3 w-3" />
                              <span>${parseFloat(reserva.monto_total).toLocaleString()}</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>👥 {reserva.personas} persona{reserva.personas !== 1 ? 's' : ''}</span>
                            <span>📅 {reserva.noches} noche{reserva.noches !== 1 ? 's' : ''}</span>
                            <span>📍 {reserva.origen}</span>
                          </div>
                          {reserva.observaciones && (
                            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              <strong>Observaciones:</strong> {reserva.observaciones}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">
                        Check-out
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(reserva.fecha_egreso)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <FaSignOutAlt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay salidas</h3>
                <p className="text-gray-500">No hay check-outs programados para esta fecha.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del día</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <FaSignInAlt className="h-6 w-6 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{entradas.length}</div>
                <div className="text-sm text-green-700">Entradas</div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <FaSignOutAlt className="h-6 w-6 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{salidas.length}</div>
                <div className="text-sm text-red-700">Salidas</div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <FaBed className="h-6 w-6 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{entradas.length - salidas.length}</div>
                <div className="text-sm text-blue-700">Neto</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntradasSalidas;
