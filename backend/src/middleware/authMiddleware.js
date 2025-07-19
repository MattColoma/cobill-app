// backend/src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey'; // Debe coincidir con el de authController

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    const token = authHeader.split(' ')[1]; // Obtener el token de "Bearer <token>"

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded; // Adjuntar los datos del usuario decodificados al objeto de solicitud
        next(); // Continuar con la siguiente función de middleware/controlador
    } catch (error) {
        console.error('Error de autenticación:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado. Por favor, inicia sesión de nuevo.' });
        }
        return res.status(401).json({ message: 'Token inválido. Acceso denegado.' });
    }
};

module.exports = authMiddleware;