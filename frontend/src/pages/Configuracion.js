import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { reservasService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Configuracion = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  const handleImport = async (file) => {
    if (!file) {
      toast.warning('Selecciona un archivo .xlsx o .csv');
      return;
    }
    setImporting(true);
    try {
      const res = await reservasService.importar(file);
      const data = res.data || {};
      toast.success(`Importadas: ${data.creadas || 0} / Errores: ${data.errores || 0}`);
      if (Array.isArray(data.detalles_error) && data.detalles_error.length > 0) {
        console.warn('Errores de importación:', data.detalles_error);
      }
    } catch (err) {
      console.error('Error importando:', err);
      const msg = err.response?.data?.error || 'Error al importar';
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Preferencias</h2>
        <p className="text-gray-600">Configuraciones generales del sistema.</p>
      </div>

      {user?.perfil?.rol === 'supervisor' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Importar reservas (.xlsx / .csv)</h2>
          <p className="text-gray-600 text-sm">Función delicada. Úsala con cuidado; validar el archivo antes de importar.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xlsm,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImport(file);
              }
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className={`px-4 py-2 rounded-md text-white ${importing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {importing ? 'Importando...' : 'Seleccionar archivo y importar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
