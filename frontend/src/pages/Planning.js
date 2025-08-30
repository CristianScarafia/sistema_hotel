import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { planningService } from '../services/api';
import { FaCalendarAlt, FaBed } from 'react-icons/fa';

const Planning = () => {
  // Función auxiliar para crear fechas de manera segura
  const createSafeDate = (dateString) => {
    if (!dateString) return new Date();
    
    if (dateString instanceof Date) return dateString;
    
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    
    return new Date(dateString);
  };

  // Crear la fecha de hoy de manera segura
  const today = new Date();
  const todayString = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
  
  const [startDate, setStartDate] = useState(todayString);
  const [planningData, setPlanningData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPlanning = useCallback(async () => {
    try {
      setLoading(true);
      const response = await planningService.getPlanning(startDate);
      setPlanningData(response.data);
    } catch (error) {
      console.error('Error al cargar el planning:', error);
      toast.error('Error al cargar el planning');
    } finally {
      setLoading(false);
    }
  }, [startDate]);

  useEffect(() => {
    loadPlanning();
  }, [startDate, loadPlanning]);

  const formatDate = (dateString) => {
    const date = createSafeDate(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  };

  const formatFullDate = (dateString) => {
    const date = createSafeDate(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleRefresh = () => {
    loadPlanning();
  };

  const getTipoColor = (tipo) => {
    const colors = {
      'doble': 'bg-blue-100 text-blue-800',
      'triple': 'bg-green-100 text-green-800',
      'cuadruple': 'bg-yellow-100 text-yellow-800',
      'quintuple': 'bg-purple-100 text-purple-800',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getOcupacionClass = (ocupacion) => {
    if (ocupacion.is_occupied) {
      return ocupacion.is_last_night 
        ? 'bg-red-200 border-r-2 border-red-500' 
        : 'bg-red-100';
    }
    return 'bg-green-50';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!planningData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se pudo cargar el planning</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planning de Reservas</h1>
          <p className="text-gray-600 mt-1">
            Vista general de ocupación de habitaciones
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
            <span>Fecha de inicio:</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={handleDateChange}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-lg font-semibold text-gray-800">
            {formatFullDate(startDate)}
          </div>
        </div>
      </div>

      {/* Tabla de Planning */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Habitación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-[100px] bg-gray-50 z-10">
                  Tipo
                </th>
                {planningData.days.map((day, index) => (
                  <th key={index} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">
                    {formatDate(day)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {planningData.planning.map((item, rowIndex) => (
                <tr key={item.habitacion.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                    <div className="flex items-center space-x-2">
                      <FaBed className="h-4 w-4 text-gray-400" />
                      <span>{item.habitacion.numero}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap sticky left-[100px] bg-white z-10">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(item.habitacion.tipo)}`}>
                      {item.habitacion.tipo}
                    </span>
                  </td>
                  {item.ocupaciones.map((ocupacion, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`px-2 py-2 text-center text-xs border-r border-gray-200 ${getOcupacionClass(ocupacion)}`}
                      title={ocupacion.nombre ? `${ocupacion.nombre} - ${ocupacion.fecha_ingreso} a ${ocupacion.fecha_egreso}` : 'Disponible'}
                    >
                      {ocupacion.nombre && (
                        <div className="truncate font-medium text-gray-900">
                          {ocupacion.nombre}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leyenda</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-50 border border-gray-300 rounded"></div>
            <span className="text-sm text-gray-700">Disponible</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-red-100 rounded"></div>
            <span className="text-sm text-gray-700">Ocupada</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-red-200 border-r-2 border-red-500 rounded"></div>
            <span className="text-sm text-gray-700">Última noche</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;
