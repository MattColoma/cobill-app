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
        setLoading(false);
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
    } else {
      if (socket.connected) {
        setLoading(false);
      }
    }

    // Al cargar la app, verificar si hay un token y si es válido
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // En un escenario real, harías una llamada a una API de backend
        // para verificar la validez del token y obtener los datos del usuario.
        // Por ahora, asumimos que si hay un token, el usuario está autenticado.
        // Opcional: podrías decodificar el token para obtener el ID y email
        // const decoded = jwt_decode(storedToken); // Necesitarías instalar jwt-decode
        setIsAuthenticated(true);
        // setUser({ id: decoded.id, email: decoded.email }); // Si decodificas
        setLoading(false);
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    verifyToken();

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

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
      } else if (currentView !== 'active_session') {
        setLoading(false);
      }
    };

    loadSessionData();
  }, [sesionDetails, currentView]);

  // --- Funciones de Autenticación ---
  // CORRECCIÓN AQUÍ: Cambiar 'name' por 'nombre' en el argumento y en el cuerpo de la solicitud
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
      setCurrentView('home');
      return { success: true, message: response.data.message };
    } catch (err) {
      console.error('Error en el inicio de sesión:', err.response?.data?.message || err.message);
      throw new Error(err.response?.data?.message || 'Credenciales inválidas.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('login');
    setSesionDetails(null);
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
        id_usuario_creador: user ? user.id : null,
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
        id_usuario: isAuthenticated ? user.id : null,
        nombre_invitado: isAuthenticated ? user.nombre : participantName
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

  if (loading) return <div className="text-center p-4 text-white">Cargando aplicación...</div>;
  if (error) return <div className="text-red-500 p-4 text-white">Error: {error}</div>;

  const renderView = () => {
    if (!isAuthenticated) {
      switch (currentView) {
        case 'register':
          return <RegisterPage onRegister={handleRegister} onGoToLogin={() => setCurrentView('login')} />;
        case 'login':
        default:
          return <LoginPage onLogin={handleLogin} onGoToRegister={() => setCurrentView('register')} />;
      }
    }

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
            <span className="text-gray-700 text-s mr-2">Hola, {user?.nombre || user?.email || 'Usuario'}!</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:underline"
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
