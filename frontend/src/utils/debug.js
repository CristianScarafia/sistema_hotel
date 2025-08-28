// Debug utility para verificar configuración de API
export const debugApiConfig = () => {
  console.log('=== DEBUG API CONFIG ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  
  // Verificar si la variable está definida
  if (process.env.REACT_APP_API_URL) {
    console.log('✅ REACT_APP_API_URL está configurada');
    console.log('URL completa:', process.env.REACT_APP_API_URL);
  } else {
    console.log('❌ REACT_APP_API_URL NO está configurada');
    console.log('Usando fallback...');
  }
  
  // Test de conexión
  fetch(process.env.REACT_APP_API_URL || '/api')
    .then(response => {
      console.log('✅ Conexión exitosa:', response.status);
    })
    .catch(error => {
      console.log('❌ Error de conexión:', error.message);
    });
};

// Función para mostrar la configuración en la consola
export const logApiConfig = () => {
  const config = {
    nodeEnv: process.env.NODE_ENV,
    apiUrl: process.env.REACT_APP_API_URL,
    timestamp: new Date().toISOString()
  };
  
  console.log('API Configuration:', config);
  return config;
};
