import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Importar los nuevos componentes de vista
import HomePage from './components/HomePage';
import CreateSessionPage from './components/CreateSessionPage';
import ActiveSessionPage from './components/ActiveSessionPage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';

// URL de tu backend
const API_URL = 'http://localhost:5000/api';

// La conexión de Socket.IO se gestionará aquí
let socket;

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados globales para la autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Almacenará { id, nombre, email }
  const [token, setToken] = useState(localStorage.getItem('token')); // Intentar cargar token del localStorage
  const [authChecked, setAuthChecked] = useState(false); // Nuevo estado para saber si la verificación inicial terminó

  // Estados globales para la lógica de Cobill
  const [currentView, setCurrentView] = useState('home'); // 'home', 'create_session', 'active_session', 'register', 'login'
  const [sesionCode, setSesionCode] = useState('');
  const [sesionDetails, setSesionDetails] = useState(null);
  const [participanteDetails, setParticipanteDetails] = useState(null);
  const [sesionItems, setSesionItems] = useState([]);
  const [sesionTotals, setSesionTotals] = useState(null);

  // useEffect para la configuración inicial de Axios y Socket.IO
  useEffect(() => {
    // Configurar el interceptor de Axios para añadir el token a todas las solicitudes
    axios.interceptors.request.use(
      config => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Inicializar la conexión de Socket.IO solo si no existe
    if (!socket) {
      socket = io('http://localhost:5000');

      socket.on('connect', () => {
        console.log('Frontend: Conectado a Socket.IO con ID:', socket.id);
        // setLoading(false); // Lo moveremos después de la verificación de autenticación
      });

      socket.on('disconnect', () => {
        console.log('Frontend: Desconectado de Socket.IO');
      });

      socket.on('sesion:creada', (data) => {
        console.log('Frontend: Evento sesion:creada recibido:', data);
        setSesionDetails(data.sesion);
        setParticipanteDetails(data.participante);
        setSesionCode(data.sesion.codigo_gasto);
        socket.emit('join_sesion', String(data.sesion.id));
        console.log('Frontend: Estados actualizados después de sesion:creada. La vista permanecerá en "create_session" hasta que el usuario navegue.');
      });

      socket.on('sesion:participante_unido', (data) => {
        console.log('Frontend: Evento sesion:participante_unido recibido:', data);
      });

      socket.on('sesion:item_agregado', async (data) => {
        console.log('Frontend: Evento sesion:item_agregado recibido:', data);
        if (data.sesionId) {
          try {
            const itemsRes = await axios.get(`${API_URL}/items-gasto/sesion/${data.sesionId}`);
            setSesionItems(itemsRes.data);
            const totalsRes = await axios.get(`${API_URL}/items-gasto/sesion/${data.sesionId}/total`);
            setSesionTotals(totalsRes.data);
            console.log('Frontend: Ítems y totales recargados por socket event.');
          } catch (fetchErr) {
            console.error('Frontend: Error al recargar ítems/totales por socket event:', fetchErr);
            setError('Error al actualizar datos de la sesión.');
          }
        }
      });

      socket.on('sesion:totales_actualizados', (data) => {
        console.log('Frontend: Evento sesion:totales_actualizados recibido:', data);
        setSesionTotals(data);
      });
    }

    // Al cargar la app, verificar si hay un token y si es válido
    const verifyAuthToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await axios.get(`${API_URL}/auth/verify-token`);
          setIsAuthenticated(true);
          setUser(response.data.user);
          setToken(storedToken); // Asegurarse de que el token esté en el estado
          setCurrentView('home'); // Si el token es válido, ir a la página de inicio
          console.log('Frontend: Autenticación verificada exitosamente.');
        } catch (err) {
          console.error('Frontend: Error al verificar token:', err.response?.data?.message || err.message);
          localStorage.removeItem('token'); // Limpiar token inválido/expirado
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
          setCurrentView('login'); // Si el token es inválido, ir a la página de login
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        setCurrentView('login'); // Si no hay token, ir a la página de login
      }
      setLoading(false); // La carga inicial ha terminado
      setAuthChecked(true); // La verificación de autenticación ha terminado
    };

    verifyAuthToken();

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []); // Dependencia vacía para que se ejecute solo una vez al montar

  // useEffect para cargar ítems y totales cuando la sesión se activa/cambia
  useEffect(() => {
    const loadSessionData = async () => {
      if (currentView === 'active_session' && sesionDetails && sesionDetails.id) {
        setLoading(true);
        console.log('Frontend: Cargando datos iniciales de la sesión activa...');
        try {
          const itemsRes = await axios.get(`${API_URL}/items-gasto/sesion/${sesionDetails.id}`);
          setSesionItems(itemsRes.data);
          const totalsRes = await axios.get(`${API_URL}/items-gasto/sesion/${sesionDetails.id}/total`);
          setSesionTotals(totalsRes.data);
          console.log('Frontend: Datos de sesión activa cargados.');
        } catch (err) {
          setError('Error al cargar datos de la sesión activa: ' + err.message);
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else if (currentView !== 'active_session' && authChecked) { // Solo si la autenticación ya fue verificada
        setLoading(false);
      }
    };

    loadSessionData();
  }, [sesionDetails, currentView, authChecked]); // Dependencia de authChecked

  // --- Funciones de Autenticación ---
  const handleRegister = async (nombre, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { nombre, email, password });
      console.log('Registro exitoso:', response.data);
      setCurrentView('login');
      return { success: true, message: response.data.message };
    } catch (err) {
      console.error('Error en el registro:', err.response?.data?.message || err.message);
      throw new Error(err.response?.data?.message || 'Error al registrarse.');
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      console.log('Inicio de sesión exitoso:', response.data);

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      setCurrentView('home'); // Redirigir a la página de inicio después del login
      return { success: true, message: response.data.message };
    } catch (err) {
      console.error('Error en el inicio de sesión:', err.response?.data?.message || err.message);
      throw new Error(err.response?.data?.message || 'Credenciales inválidas.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminar el token de localStorage
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('login'); // Redirigir al login después del logout
    setSesionDetails(null); // Limpiar datos de sesión al cerrar sesión
    setParticipanteDetails(null);
    setSesionCode('');
    setSesionItems([]);
    setSesionTotals(null);
    console.log('Usuario ha cerrado sesión.');
  };

  // --- Funciones de Sesión de Gasto ---
  const handleCreateSession = async (nombreSesion, porcentajePropina) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/sesiones`, {
        nombre_sesion: nombreSesion || 'Nueva Sesión de Gastos',
        id_usuario_creador: user ? user.id : null, // Usar el ID del usuario autenticado
        porcentaje_propina: parseFloat(porcentajePropina)
      });
      console.log('Frontend: Respuesta de crear sesión recibida:', response.data);

      setSesionDetails(response.data.sesion);
      setParticipanteDetails(response.data.participante);
      setSesionCode(response.data.sesion.codigo_gasto);

      socket.emit('join_sesion', String(response.data.sesion.id));
      console.log('Frontend: Sesión creada por API. Emitiendo join_sesion a Socket.IO.');

    } catch (err) {
      setError('Error al crear sesión: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (code, participantName) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/participantes-sesion/unirse`, {
        codigo_gasto: code.toUpperCase(),
        id_usuario: isAuthenticated ? user.id : null, // Pasar id_usuario si está autenticado
        nombre_invitado: isAuthenticated ? user.nombre : participantName // Usar nombre de usuario o el proporcionado
      });
      setSesionDetails(response.data.sesion);
      setParticipanteDetails(response.data.participante);
      setSesionCode(response.data.sesion.codigo_gasto);
      setCurrentView('active_session');
      socket.emit('join_sesion', String(response.data.sesion.id));
      console.log('Frontend: Unido a sesión por API. Emitiendo join_sesion a Socket.IO.');
    } catch (err) {
      setError('Error al unirse a sesión: ' + (err.response?.data?.message || err.message));
      console.error(err.response ? err.response.data : err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (descripcion, costo) => {
    if (!participanteDetails || !sesionDetails) {
      setError('Debes estar en una sesión para agregar ítems.');
      return;
    }
    if (!descripcion || !costo) {
      setError('Descripción y costo del ítem son requeridos.');
      return;
    }
    if (isNaN(costo) || parseFloat(costo) <= 0) {
      setError('El costo debe ser un número positivo.');
      return;
    }

    try {
      await axios.post(`${API_URL}/items-gasto`, {
        id_participante_sesion: participanteDetails.id,
        descripcion_item: descripcion,
        costo_item: parseFloat(costo)
      });
      console.log('Frontend: Ítem agregado por API. Esperando actualización de Socket.IO.');
    } catch (err) {
      setError('Error al agregar ítem: ' + (err.response?.data?.message || err.message));
      console.error(err.response ? err.response.data : err);
    }
  };

  const handleLeaveSession = () => {
    setSesionDetails(null);
    setParticipanteDetails(null);
    setSesionCode('');
    setSesionItems([]);
    setSesionTotals(null);
    setCurrentView('home');
    console.log('Frontend: Saliendo de la sesión. Volviendo a la vista de inicio.');
  };

  // Renderizado condicional basado en el estado de autenticación y si la verificación terminó
  const renderView = () => {
    if (loading || !authChecked) { // Muestra "Cargando" hasta que la verificación de autenticación termine
      return <div className="text-center p-4 text-white">Cargando aplicación...</div>;
    }

    if (error) {
      return <div className="text-red-500 p-4 text-white">Error: {error}</div>;
    }

    // Si no está autenticado, mostrar login o registro
    if (!isAuthenticated) {
      switch (currentView) {
        case 'register':
          return <RegisterPage onRegister={handleRegister} onGoToLogin={() => setCurrentView('login')} />;
        case 'login':
        default: // Por defecto, si no está autenticado, ir al login
          return <LoginPage onLogin={handleLogin} onGoToRegister={() => setCurrentView('register')} />;
      }
    }

    // Si está autenticado, mostrar las vistas de la aplicación principal
    switch (currentView) {
      case 'home':
        return (
          <HomePage
            onJoinSession={handleJoinSession}
            onGoToCreateSession={() => setCurrentView('create_session')}
          />
        );
      case 'create_session':
        return (
          <CreateSessionPage
            onCreateSession={handleCreateSession}
            sesionDetails={sesionDetails}
            participanteDetails={participanteDetails}
            onGoToActiveSession={() => setCurrentView('active_session')}
            onGoToHome={handleLeaveSession}
          />
        );
      case 'active_session':
        return (
          <ActiveSessionPage
            sesionDetails={sesionDetails}
            participanteDetails={participanteDetails}
            sesionItems={sesionItems}
            sesionTotals={sesionTotals}
            onAddItem={handleAddItem}
            onLeaveSession={handleLeaveSession}
          />
        );
      default:
        return (
          <HomePage
            onJoinSession={handleJoinSession}
            onGoToCreateSession={() => setCurrentView('create_session')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-petroleoBlue flex flex-col items-center justify-center py-8">
      <div className="p-6 max-w-3xl w-full mx-auto bg-white rounded-lg shadow-xl font-inter">
        <div className="text-center mb-8">
          <img
            src="/img/Logo_sin_fondo.png"
            alt="Cobill App Logo"
            className="mx-auto h-24 w-auto rounded-md"
            onError={(e) => {
                console.error("Error al cargar el logo:", e.target.src);
                e.target.onerror = null;
                e.target.src = "https://placehold.co/200x80/CCCCCC/000000?text=Logo+Error";
            }}
          />
        </div>
        {isAuthenticated && currentView !== 'login' && currentView !== 'register' && (
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 text-sm">Hola, {user?.nombre || user?.email || 'Usuario'}!</span>
            <button
              onClick={handleLogout}
              className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded-md text-sm shadow-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
        {renderView()}
      </div>
    </div>
  );
}

export default App;
