// backend/src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Importa el middleware de autenticación

// Ruta para registrar un nuevo usuario
router.post('/register', authController.register);

// Ruta para iniciar sesión
router.post('/login', authController.login);

// NUEVA RUTA: Para verificar la validez del token
// GET /api/auth/verify-token
router.get('/verify-token', authMiddleware, authController.verifyToken); // Protegida por el middleware

module.exports = router;