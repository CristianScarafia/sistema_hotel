import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { reservasService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaBed, FaUsers, FaBroom, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const OcupacionLimpieza = () => {
  const { user } = useAuth();
  
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
  
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [ocupacionData, setOcupacionData] = useState([]);
  const [limpiezaData, setLimpiezaData] = useState({
    aLimpio: [],
    aPasajero: [],
    aLimpioPasajero: []
  });
  const [medialunasData, setMedialunasData] = useState({
    fecha_siguiente: '',
    total_personas: 0,
    docenas_necesarias: 0,
    medialunas_totales: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('=== USE EFFECT TRIGGERED ===');
    console.log('User:', user);
    console.log('Selected date:', selectedDate);
    loadData();
  }, [selectedDate, user, loadData]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Debug: verificar autenticación
      console.log('=== DEBUG OCUPACION LIMPIEZA ===');
      console.log('Usuario autenticado:', user);
      console.log('Fecha seleccionada:', selectedDate);
      
      if (!user) {
        console.error('Usuario no autenticado');
        toast.error('Debe estar logueado para ver esta información');
        return;
      }
      
             // Cargar datos de ocupación usando el servicio configurado
       console.log('Cargando datos de ocupación...');
       const dataOcupacion = await reservasService.getReservasPorFecha(selectedDate);
       console.log('Datos de ocupación:', dataOcupacion);
       
       // Manejar la nueva estructura de respuesta que incluye medialunas
       if (dataOcupacion && typeof dataOcupacion === 'object' && 'reservas' in dataOcupacion) {
         setOcupacionData(Array.isArray(dataOcupacion.reservas) ? dataOcupacion.reservas : []);
         setMedialunasData(dataOcupacion.medialunas || {
           fecha_siguiente: '',
           total_personas: 0,
           docenas_necesarias: 0,
           medialunas_totales: 0
         });
       } else {
         // Mantener compatibilidad con la estructura anterior
         setOcupacionData(Array.isArray(dataOcupacion) ? dataOcupacion : []);
         setMedialunasData({
           fecha_siguiente: '',
           total_personas: 0,
           docenas_necesarias: 0,
           medialunas_totales: 0
         });
       }

      // Cargar datos de limpieza usando el servicio configurado
      console.log('Cargando datos de limpieza...');
      const dataLimpieza = await reservasService.getLimpieza(selectedDate);
      console.log('Datos de limpieza:', dataLimpieza);
      setLimpiezaData({
        aLimpio: dataLimpieza.a_limpiar || [],
        aPasajero: dataLimpieza.a_pasajero || [],
        aLimpioPasajero: dataLimpieza.a_limpiar_pasajero || []
      });
    } catch (error) {
      console.error('Error al cargar datos:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Error al cargar los datos de ocupación y limpieza');
      // Establecer arrays vacíos en caso de error
      setOcupacionData([]);
      setLimpiezaData({
        aLimpio: [],
        aPasajero: [],
        aLimpioPasajero: []
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, user]);

  const formatDate = (dateString) => {
    const date = createSafeDate(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleRefresh = () => {
    loadData();
  };

  // Mostrar información de debug
  console.log('=== RENDER DEBUG ===');
  console.log('User:', user);
  console.log('Loading:', loading);
  console.log('Ocupacion data:', ocupacionData);
  console.log('Limpieza data:', limpiezaData);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mostrar mensaje si no está autenticado
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No autenticado</h2>
          <p className="text-gray-600">Debe estar logueado para ver esta información</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ocupación y Limpieza</h1>
          <p className="text-gray-600 mt-1">
            Gestión de habitaciones ocupadas y estado de limpieza
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
            <span>Fecha:</span>
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Sección de Medialunas */}
         <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow p-6">
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3">
               <div className="bg-white rounded-full p-3 flex items-center justify-center">
                 <span className="text-2xl">🥐</span>
               </div>
               <div>
                 <h3 className="text-xl font-bold text-white">Medialunas para el día siguiente</h3>
                 <p className="text-yellow-100">
                   {medialunasData.fecha_siguiente && 
                     `(${new Date(medialunasData.fecha_siguiente).toLocaleDateString('es-ES', {
                       weekday: 'long',
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric'
                     })})`
                   }
                 </p>
               </div>
             </div>
             <div className="text-right">
               <div className="text-3xl font-bold text-white">
                 {medialunasData.docenas_necesarias} docenas
               </div>
               <div className="text-yellow-100">
                 {medialunasData.total_personas} personas × 2.5 = {medialunasData.medialunas_totales} medialunas
               </div>
             </div>
           </div>
         </div>

         {/* Espacio vacío para mantener el grid */}
         <div></div>

         {/* Tabla de Ocupación */}
         <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <FaUsers className="h-5 w-5 text-blue-600" />
              <span>Habitaciones Ocupadas</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Habitación
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad de Personas
                  </th>
                </tr>
              </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                 {ocupacionData.length > 0 ? (
                   <>
                     {ocupacionData.map((reserva) => (
                       <tr key={reserva.id} className="hover:bg-gray-50">
                         <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                           <div className="flex items-center space-x-2">
                             <FaBed className="h-4 w-4 text-gray-400" />
                             <span>{reserva.habitacion_numero}</span>
                           </div>
                         </td>
                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                           {reserva.nombre_completo}
                         </td>
                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                           {reserva.personas}
                         </td>
                       </tr>
                     ))}
                     {/* Fila totalizadora */}
                     <tr className="bg-gray-50 font-semibold">
                       <td className="px-4 py-3 text-sm text-gray-700">
                         <span className="font-bold">TOTAL</span>
                       </td>
                       <td className="px-4 py-3 text-sm text-gray-700">
                         <span className="font-bold">{ocupacionData.length} habitaciones</span>
                       </td>
                       <td className="px-4 py-3 text-sm text-gray-700">
                         <span className="font-bold">
                           {ocupacionData.reduce((total, reserva) => total + reserva.personas, 0)} personas
                         </span>
                       </td>
                     </tr>
                   </>
                 ) : (
                   <tr>
                     <td colSpan="3" className="px-4 py-8 text-center text-sm text-gray-500">
                       No hay habitaciones ocupadas para esta fecha
                     </td>
                   </tr>
                 )}
               </tbody>
            </table>
          </div>
        </div>

        {/* Tabla de Limpieza */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <FaBroom className="h-5 w-5 text-green-600" />
              <span>Estado de Limpieza</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FaCheck className="h-4 w-4 text-green-600" />
                      <span>A Limpiar</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FaExclamationTriangle className="h-4 w-4 text-yellow-600" />
                      <span>A Pasajero</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FaBroom className="h-4 w-4 text-blue-600" />
                      <span>A Limpiar + Pasajero</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="space-y-1">
                      {limpiezaData.aLimpio.length > 0 ? (
                        limpiezaData.aLimpio.map((habitacion) => (
                          <div key={habitacion.id} className="flex items-center space-x-2">
                            <FaBed className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">{habitacion.numero}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500">Ninguna</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="space-y-1">
                      {limpiezaData.aPasajero.length > 0 ? (
                        limpiezaData.aPasajero.map((habitacion) => (
                          <div key={habitacion.id} className="flex items-center space-x-2">
                            <FaBed className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">{habitacion.numero}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500">Ninguna</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="space-y-1">
                      {limpiezaData.aLimpioPasajero.length > 0 ? (
                        limpiezaData.aLimpioPasajero.map((habitacion) => (
                          <div key={habitacion.id} className="flex items-center space-x-2">
                            <FaBed className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">{habitacion.numero}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500">Ninguna</span>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leyenda de Limpieza</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <FaCheck className="h-5 w-5 text-green-600" />
            <div>
              <span className="text-sm font-medium text-gray-700">A Limpiar</span>
              <p className="text-xs text-gray-500">Se fue el pasajero</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FaExclamationTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <span className="text-sm font-medium text-gray-700">A Pasajero</span>
              <p className="text-xs text-gray-500">Está el pasajero pero hay que repasar</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FaBroom className="h-5 w-5 text-blue-600" />
            <div>
              <span className="text-sm font-medium text-gray-700">A Limpiar + Pasajero</span>
              <p className="text-xs text-gray-500">4ª noche, tiene al menos 1 noche más</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OcupacionLimpieza;
