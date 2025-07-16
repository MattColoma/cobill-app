// backend/src/controllers/sesionGastoController.js

const SesionGasto = require('../models/sesionGastoModel');
const ParticipanteSesion = require('../models/participanteSesionModel');
const { generateRandomCode } = require('../utils/helpers');

module.exports = (io) => {
    /**
     * Controlador para crear una nueva sesión de gasto.
     * Genera un código aleatorio y registra la sesión y al usuario creador como participante.
     * @param {Object} req - Objeto de solicitud de Express (req.body puede contener nombre_sesion, id_usuario_creador, porcentaje_propina).
     * @param {Object} res - Objeto de respuesta de Express.
     */
    const createSesionGasto = async (req, res) => {
        const { nombre_sesion, id_usuario_creador, porcentaje_propina } = req.body;

        console.log('Backend (createSesionGasto): Datos de la solicitud:', { nombre_sesion, id_usuario_creador, porcentaje_propina }); // Debug 1

        let codigo_gasto;
        let sesionExistente;

        try { // Moved the do-while loop inside try for better error handling if generateRandomCode fails
            do {
                codigo_gasto = generateRandomCode(6);
                sesionExistente = await SesionGasto.getByCodigo(codigo_gasto);
            } while (sesionExistente);
        } catch (err) {
            console.error('Backend (createSesionGasto): Error al generar código de gasto o verificar existencia:', err);
            return res.status(500).json({ message: 'Error interno del servidor al generar código de sesión.' });
        }

        console.log('Backend (createSesionGasto): Código de gasto generado:', codigo_gasto); // Debug 2

        try {
            console.log('Backend (createSesionGasto): Intentando crear sesión en DB con:', { codigo_gasto, nombre_sesion, id_usuario_creador, porcentaje_propina }); // Debug BEFORE DB call
            const newSesion = await SesionGasto.create(
                codigo_gasto,
                nombre_sesion,
                id_usuario_creador,
                porcentaje_propina
            );

            console.log('Backend (createSesionGasto): Sesión creada en DB:', newSesion); // Debug 3
            // Check if newSesion is valid before proceeding
            if (!newSesion || !newSesion.id) {
                console.error('Backend (createSesionGasto): Sesión no creada o ID inválido:', newSesion);
                return res.status(500).json({ message: 'Error al crear la sesión en la base de datos.' });
            }

            const participanteCreador = await ParticipanteSesion.create(
                newSesion.id,
                id_usuario_creador,
                id_usuario_creador ? null : 'Creador de Sesión'
            );

            console.log('Backend (createSesionGasto): Participante creado:', participanteCreador); // Debug 4

            // Line where the error occurs (now with more checks):
            io.to(String(newSesion.id)).emit('sesion:creada', {
                sesion: newSesion,
                participante: participanteCreador
            });
            console.log(`Evento 'sesion:creada' emitido a la sala ${newSesion.id}`);

            res.status(201).json({
                message: 'Sesión de gasto creada exitosamente',
                sesion: newSesion,
                participante: participanteCreador
            });
        } catch (err) {
            console.error('Backend (createSesionGasto): Error en el bloque try/catch principal:', err); // Debug 5
            res.status(500).json({ message: 'Error interno del servidor al crear la sesión de gasto.' });
        }
    };

    /**
     * Controlador para obtener una sesión de gasto por su código.
     * @param {Object} req - Objeto de solicitud de Express (req.params.codigo_gasto).
     * @param {Object} res - Objeto de respuesta de Express.
     */
    const getSesionGastoByCodigo = async (req, res) => {
        try {
            const sesion = await SesionGasto.getByCodigo(req.params.codigo_gasto);
            if (!sesion) {
                return res.status(404).json({ message: 'Sesión de gasto no encontrada.' });
            }
            res.json(sesion);
        } catch (err) {
            console.error('Error en getSesionGastoByCodigo:', err);
            res.status(500).json({ message: 'Error interno del servidor al obtener la sesión de gasto.' });
        }
    };

    /**
     * Controlador para actualizar el estado o propina de una sesión de gasto.
     * @param {Object} req - Objeto de solicitud de Express (req.params.id, req.body.estado, req.body.porcentaje_propina).
     * @param {Object} res - Objeto de respuesta de Express.
     */
    const updateSesionGasto = async (req, res) => {
        const { id } = req.params;
        const { estado, porcentaje_propina } = req.body;
        try {
            const updated = await SesionGasto.update(id, estado, porcentaje_propina);
            if (!updated) {
                return res.status(404).json({ message: 'Sesión de gasto no encontrada o no se pudo actualizar.' });
            }
            // Emitir evento de actualización de sesión
            io.to(String(id)).emit('sesion:actualizada', { id, estado, porcentaje_propina }); // Emitir a la sala de la sesión
            res.json({ message: 'Sesión de gasto actualizada exitosamente.' });
        } catch (err) {
            console.error('Error en updateSesionGasto:', err);
            res.status(500).json({ message: 'Error interno del servidor al actualizar la sesión de gasto.' });
        }
    };

    // Exportar todas las funciones del controlador
    return {
        createSesionGasto,
        getSesionGastoByCodigo,
        updateSesionGasto
    };
};
