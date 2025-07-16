// backend/src/controllers/itemGastoController.js

const ItemGasto = require('../models/itemGastoModel');
const ParticipanteSesion = require('../models/participanteSesionModel');

// Exportamos una FUNCIÓN que recibe 'io' como argumento
module.exports = (io) => { // Recibe 'io' aquí
    /**
     * Controlador para agregar un nuevo ítem de gasto.
     * @param {Object} req - Objeto de solicitud de Express (req.body.id_participante_sesion, req.body.descripcion_item, req.body.costo_item).
     * @param {Object} res - Objeto de respuesta de Express.
     */
    const addItemGasto = async (req, res) => { // Definido como const
        const { id_participante_sesion, descripcion_item, costo_item } = req.body;

        if (!id_participante_sesion || !descripcion_item || costo_item === undefined || costo_item === null) {
            return res.status(400).json({ message: 'ID de participante, descripción y costo del ítem son requeridos.' });
        }
        if (isNaN(costo_item) || parseFloat(costo_item) < 0) {
            return res.status(400).json({ message: 'El costo del ítem debe ser un número positivo.' });
        }

        try {
            const participante = await ParticipanteSesion.getById(id_participante_sesion);
            if (!participante) {
                return res.status(404).json({ message: 'Participante de sesión no encontrado.' });
            }

            const newItem = await ItemGasto.create(
                id_participante_sesion,
                descripcion_item,
                parseFloat(costo_item) // Asegurarse de que el costo sea un número flotante
            );

            // Emitir evento Socket.IO a la sala de la sesión
            const sesionId = participante.id_sesion_gasto;
            io.to(String(sesionId)).emit('sesion:item_agregado', { // Convertir a String para la sala de Socket.IO
                item: newItem,
                participanteId: id_participante_sesion,
                sesionId: sesionId
            });
            // También podemos emitir una actualización de totales
            const totalesSesion = await ItemGasto.getTotalBySesion(sesionId);
            io.to(String(sesionId)).emit('sesion:totales_actualizados', totalesSesion);


            res.status(201).json({ message: 'Ítem de gasto agregado exitosamente.', item: newItem });
        } catch (err) {
            console.error('Error en addItemGasto:', err);
            res.status(500).json({ message: 'Error interno del servidor al agregar el ítem de gasto.' });
        }
    };

    /**
     * Controlador para obtener los ítems de gasto de un participante específico.
     * @param {Object} req - Objeto de solicitud de Express (req.params.id_participante_sesion).
     * @param {Object} res - Objeto de respuesta de Express.
     */
    const getItemsByParticipante = async (req, res) => { // Definido como const
        try {
            const items = await ItemGasto.getByParticipanteId(req.params.id_participante_sesion);
            res.json(items);
        } catch (err) {
            console.error('Error en getItemsByParticipante:', err);
            res.status(500).json({ message: 'Error interno del servidor al obtener los ítems del participante.' });
        }
    };

    /**
     * Controlador para obtener todos los ítems de gasto de una sesión completa.
     * @param {Object} req - Objeto de solicitud de Express (req.params.id_sesion_gasto).
     * @param {Object} res - Objeto de respuesta de Express.
     */
    const getItemsBySesion = async (req, res) => { // Definido como const
        try {
            const items = await ItemGasto.getBySesionId(req.params.id_sesion_gasto);
            res.json(items);
        } catch (err) {
            console.error('Error en getItemsBySesion:', err);
            res.status(500).json({ message: 'Error interno del servidor al obtener los ítems de la sesión.' });
        }
    };

    /**
     * Controlador para obtener el total de gastos de un participante.
     * @param {Object} req - Objeto de solicitud de Express (req.params.id_participante_sesion).
     * @param {Object} res - Objeto de respuesta de Express.
     */
    const getTotalParticipante = async (req, res) => { // Definido como const
        try {
            const total = await ItemGasto.getTotalByParticipante(req.params.id_participante_sesion);
            res.json({ total_consumido: total });
        } catch (err) {
            console.error('Error en getTotalParticipante:', err);
            res.status(500).json({ message: 'Error interno del servidor al calcular el total del participante.' });
        }
    };

    /**
     * Controlador para obtener el total de gastos de una sesión completa, incluyendo propina.
     * @param {Object} req - Objeto de solicitud de Express (req.params.id_sesion_gasto).
     * @param {Object} res - Objeto de respuesta de Express.
     */
    const getTotalSesion = async (req, res) => { // Definido como const
        try {
            const totals = await ItemGasto.getTotalBySesion(req.params.id_sesion_gasto);
            res.json(totals);
        } catch (err) {
            console.error('Error en getTotalSesion:', err);
            res.status(500).json({ message: 'Error interno del servidor al calcular el total de la sesión.' });
        }
    };

    // Exportar todas las funciones del controlador
    return {
        addItemGasto,
        getItemsByParticipante,
        getItemsBySesion,
        getTotalParticipante,
        getTotalSesion
    };
};
