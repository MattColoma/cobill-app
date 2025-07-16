// backend/src/routes/itemGastoRoutes.js

const express = require('express');
const router = express.Router();

// Exportamos una función que recibe 'io'
module.exports = (io) => {
    // Importar el controlador y pasarle la instancia de 'io'
    const itemGastoController = require('../controllers/itemGastoController')(io);

    router.post('/', itemGastoController.addItemGasto);
    router.get('/participante/:id_participante_sesion', itemGastoController.getItemsByParticipante);
    router.get('/sesion/:id_sesion_gasto', itemGastoController.getItemsBySesion);
    router.get('/participante/:id_participante_sesion/total', itemGastoController.getTotalParticipante);
    router.get('/sesion/:id_sesion_gasto/total', itemGastoController.getTotalSesion);

    return router;
};
