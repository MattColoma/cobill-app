// backend/src/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dbPool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Crear un servidor HTTP a partir de la aplicación Express
const server = http.createServer(app);

// Configurar Socket.IO para que escuche en el servidor HTTP
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Permitir conexiones desde tu frontend de React
        methods: ["GET", "POST", "PUT", "DELETE"] // Asegúrate de incluir todos los métodos necesarios
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Manejo de errores del pool de la base de datos
dbPool.on('error', err => {
    console.error('Error en el pool de la base de datos:', err);
});

// Importar el middleware de autenticación
const authMiddleware = require('./middleware/authMiddleware');

// <--- RUTAS DE AUTENTICACIÓN --->
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); // Prefijo para rutas de autenticación

// <--- RUTAS PARA COBILL APP (GENERALIZADAS) --->
// Pasamos la instancia de 'io' a las rutas para que los controladores puedan usarla
// Y APLICAMOS EL MIDDLEWARE DE AUTENTICACIÓN A ESTAS RUTAS
const sesionGastoRoutes = require('./routes/sesionGastoRoutes')(io);
const participanteSesionRoutes = require('./routes/participanteSesionRoutes')(io);
const itemGastoRoutes = require('./routes/itemGastoRoutes')(io);

// Aplicar el middleware de autenticación a las rutas protegidas
// Todas las rutas que comienzan con /api/sesiones, /api/participantes-sesion, /api/items-gasto
// ahora requerirán un JWT válido.
app.use('/api/sesiones', authMiddleware, sesionGastoRoutes);
app.use('/api/participantes-sesion', authMiddleware, participanteSesionRoutes);
app.use('/api/items-gasto', authMiddleware, itemGastoRoutes);

// Ruta de bienvenida (no protegida)
app.get('/', (req, res) => {
    res.send('API de Cobill funcionando!');
});

// Manejo de conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    socket.on('join_sesion', (sesionId) => {
        socket.join(sesionId);
        console.log(`Usuario ${socket.id} se unió a la sesión ${sesionId}`);
    });

    socket.on('disconnect', () => {
        console.log(`Usuario desconectado: ${socket.id}`);
    });
});

// Iniciar el servidor HTTP (NO app.listen)
server.listen(PORT, () => {
    console.log(`Servidor backend de Cobill (HTTP + Socket.IO) corriendo en http://localhost:${PORT}`);
});
