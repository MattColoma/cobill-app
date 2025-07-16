// backend/src/controllers/participanteSesionController.js

const ParticipanteSesion = require('../models/participanteSesionModel');
const SesionGasto = require('../models/sesionGastoModel');

// Exportamos una FUNCIÓN que recibe 'io' como argumento
module.exports = (io) => { // Recibe 'io' aquí
    /**
     * Controlador para unirse a una sesión de gasto.
     * @param {Object} req - Objeto de solicitud de Express (req.body.codigo_gasto, req.body.id_usuario, req.body.nombre_invitado).
     * @param {Object} res - Objeto de respuesta de Express.
     */
    const joinSesionGasto = async (req, res) => { // Definido como const
        const { codigo_gasto, id_usuario, nombre_invitado } = req.body;

        if (!codigo_gasto || (!id_usuario && !nombre_invitado)) {
            return res.status(400).json({ message: 'Código de sesión y nombre de participante (o ID de usuario) son requeridos.' });
        }

        try {
            const sesion = await SesionGasto.getByCodigo(codigo_gasto);
            if (!sesion) {
                return res.status(404).json({ message: 'La sesión de gasto con este código no existe.' });
            }

            const participantesExistentes = await ParticipanteSesion.getBySesionId(sesion.id);
            const yaEsParticipante = participantesExistentes.some(p =>
                (id_usuario && p.id_usuario === id_usuario) ||
                (nombre_invitado && p.nombre_participante === nombre_invitado)
            );

            if (yaEsParticipante) {
                const existingParticipant = participantesExistentes.find(p =>
                    (id_usuario && p.id_usuario === id_usuario) ||
                    (nombre_invitado && p.nombre_participante === nombre_invitado)
                );
                io.to(String(sesion.id)).emit('sesion:participante_unido', { // Convertir a String para la sala de Socket.IO
                    participante: existingParticipant,
                    sesionId: sesion.id
                });
                return res.status(200).json({
                    message: 'Ya eres participante de esta sesión.',
                    participante: existingParticipant,
                    sesion: sesion
                });
            }

            const newParticipante = await ParticipanteSesion.create(
                sesion.id,
                id_usuario,
                nombre_invitado
            );

            io.to(String(sesion.id)).emit('sesion:participante_unido', { // Convertir a String para la sala de Socket.IO
                participante: newParticipante,
                sesionId: sesion.id
            });

            res.status(201).json({
                message: 'Unido a la sesión exitosamente.',
                participante: newParticipante,
                sesion: sesion
            });
        } catch (err) {
            console.error('Error en joinSesionGasto:', err);
            res.status(500).json({ message: 'Error interno del servidor al unirse a la sesión.' });
        }
    };

    /**
     * Controlador para obtener todos los participantes de una sesión de gasto.
     * @param {Object} req - Objeto de solicitud de Express (req.params.id_sesion_gasto).
     * @param {Object} res - Objeto de respuesta de Express.
     */
    const getParticipantesBySesion = async (req, res) => { // Definido como const
        try {
            const participantes = await ParticipanteSesion.getBySesionId(req.params.id_sesion_gasto);
            res.json(participantes);
        } catch (err) {
            console.error('Error en getParticipantesBySesion:', err);
            res.status(500).json({ message: 'Error interno del servidor al obtener los participantes.' });
        }
    };

    // Exportar todas las funciones del controlador
    return {
        joinSesionGasto,
        getParticipantesBySesion
    };
};
