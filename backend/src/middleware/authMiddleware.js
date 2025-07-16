    // backend/src/middleware/authMiddleware.js

    const jwt = require('jsonwebtoken');

    const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey'; // Debe ser la misma clave que en authController.js

    /**
     * Middleware para verificar el token JWT.
     * Si el token es válido, adjunta el usuario decodificado a req.user y pasa al siguiente middleware/ruta.
     * Si el token es inválido o no existe, responde con un error 401 (No autorizado) o 403 (Prohibido).
     */
    module.exports = (req, res, next) => {
        // Obtener el token del encabezado de autorización
        // El formato esperado es "Bearer TOKEN"
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({ message: 'No hay token, autorización denegada.' });
        }

        const token = authHeader.split(' ')[1]; // Obtener solo el token (después de "Bearer ")

        if (!token) {
            return res.status(401).json({ message: 'Formato de token inválido, autorización denegada.' });
        }

        try {
            // Verificar el token
            const decoded = jwt.verify(token, jwtSecret);

            // Adjuntar el usuario decodificado al objeto de solicitud
            req.user = decoded; // req.user.id y req.user.email estarán disponibles en las rutas
            next(); // Pasar al siguiente middleware/ruta
        } catch (error) {
            console.error('Error de verificación de token:', error.message);
            res.status(403).json({ message: 'Token no válido.' }); // Token no válido (ej. expirado, manipulado)
        }
    };
    