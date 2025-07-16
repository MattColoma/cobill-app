// backend/src/routes/participanteSesionRoutes.js

const express = require('express');
const router = express.Router();

// Exportamos una función que recibe 'io'
module.exports = (io) => {
    // Importar el controlador y pasarle la instancia de 'io'
    const participanteSesionController = require('../controllers/participanteSesionController')(io);

    // Ruta para unirse a una sesión de gasto
    // POST /api/participantes-sesion/unirse
    router.post('/unirse', participanteSesionController.joinSesionGasto);

    // Ruta para obtener todos los participantes de una sesión de gasto por su ID de sesión
    // GET /api/participantes-sesion/sesion/:id_sesion_gasto
    router.get('/sesion/:id_sesion_gasto', participanteSesionController.getParticipantesBySesion);

    return router;
};
