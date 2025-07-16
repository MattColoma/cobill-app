// backend/src/routes/sesionGastoRoutes.js

const express = require('express');
const router = express.Router();

// Exportamos una función que recibe 'io'
module.exports = (io) => {
    // Importar el controlador y pasarle la instancia de 'io'
    const sesionGastoController = require('../controllers/sesionGastoController')(io);

    router.post('/', sesionGastoController.createSesionGasto);
    router.get('/:codigo_gasto', sesionGastoController.getSesionGastoByCodigo);
    router.put('/:id', sesionGastoController.updateSesionGasto);

    return router;
};
