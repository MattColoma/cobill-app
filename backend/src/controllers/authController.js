// backend/src/controllers/authController.js

const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey'; // Usar una clave por defecto solo para desarrollo

/**
 * Registra un nuevo usuario.
 * @param {Object} req - Objeto de solicitud de Express (req.body.nombre, req.body.email, req.body.password).
 * @param {Object} res - Objeto de respuesta de Express.
 */
exports.register = async (req, res) => {
    const { nombre, email, password } = req.body;

    // <-- Depuración: Muestra los datos que el backend recibe
    console.log('Backend: Datos recibidos para registro:', { nombre, email, password: password ? '******' : 'N/A' });

    if (!nombre || !email || !password) {
        // <-- Depuración: Indica que la validación falló
        console.error('Backend: Campos requeridos faltantes para registro.');
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    try {
        // Verificar si el usuario ya existe
        const existingUser = await Usuario.getByEmail(email);
        if (existingUser) {
            console.warn('Backend: Intento de registro con email ya existente:', email);
            return res.status(409).json({ message: 'El email ya está registrado.' });
        }

        const newUser = await Usuario.create(nombre, email, password);

        // Generar un token JWT para el nuevo usuario
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            jwtSecret,
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        console.log('Backend: Usuario registrado exitosamente. ID:', newUser.id);
        res.status(201).json({
            message: 'Usuario registrado exitosamente.',
            token,
            user: { id: newUser.id, nombre: newUser.nombre, email: newUser.email }
        });
    } catch (error) {
        console.error('Backend: Error al registrar usuario:', error.message);
        res.status(500).json({ message: 'Error interno del servidor al registrar usuario.' });
    }
};

/**
 * Inicia sesión de un usuario.
 * @param {Object} req - Objeto de solicitud de Express (req.body.email, req.body.password).
 * @param {Object} res - Objeto de respuesta de Express.
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // <-- Depuración: Muestra los datos que el backend recibe
    console.log('Backend: Datos recibidos para login:', { email, password: password ? '******' : 'N/A' });

    if (!email || !password) {
        // <-- Depuración: Indica que la validación falló
        console.error('Backend: Email o contraseña faltantes para login.');
        return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    try {
        // Buscar el usuario por email
        const user = await Usuario.getByEmail(email);
        if (!user) {
            console.warn('Backend: Intento de login con email no encontrado:', email);
            return res.status(401).json({ message: 'Credenciales inválidas.' }); // Email no encontrado
        }

        // Comparar la contraseña proporcionada con la contraseña hasheada
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn('Backend: Intento de login con contraseña incorrecta para email:', email);
            return res.status(401).json({ message: 'Credenciales inválidas.' }); // Contraseña incorrecta
        }

        // Generar un token JWT para el usuario autenticado
        const token = jwt.sign(
            { id: user.id, email: user.email },
            jwtSecret,
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        console.log('Backend: Inicio de sesión exitoso para usuario ID:', user.id);
        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token,
            user: { id: user.id, nombre: user.nombre, email: user.email }
        });
    } catch (error) {
        console.error('Backend: Error al iniciar sesión:', error.message);
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
};
