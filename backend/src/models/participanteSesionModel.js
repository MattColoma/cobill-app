// backend/src/models/participanteSesionModel.js

// CAMBIO AQUÍ: Importamos el pool de conexiones de PostgreSQL
const pool = require('../config/db');

class ParticipanteSesion {
    /**
     * Crea un nuevo participante en una sesión de gasto.
     * @param {number} id_sesion_gasto - ID de la sesión a la que se une.
     * @param {number} [id_usuario] - ID del usuario registrado (opcional).
     * @param {string} [nombre_invitado] - Nombre del invitado (si id_usuario es NULL).
     * @returns {Promise<Object>} El objeto del participante creado con su ID.
     */
    static async create(id_sesion_gasto, id_usuario = null, nombre_invitado = null) {
        try {
            // CAMBIO AQUÍ: PostgreSQL usa RETURNING id para obtener el ID generado
            const result = await pool.query(
                `INSERT INTO "ParticipanteSesion" (id_sesion_gasto, id_usuario, nombre_invitado)
                 VALUES ($1, $2, $3) RETURNING id`,
                [id_sesion_gasto, id_usuario, nombre_invitado]
            );
            return {
                id: result.rows[0].id, // CAMBIO AQUÍ: El ID está en result.rows[0].id
                id_sesion_gasto,
                id_usuario,
                nombre_invitado
            };
        } catch (error) {
            console.error("Error al crear un nuevo participante de sesión (PostgreSQL):", error.message);
            throw error;
        }
    }

    /**
     * Obtiene los participantes de una sesión de gasto.
     * Incluye el nombre del usuario registrado o el nombre del invitado.
     * @param {number} id_sesion_gasto - ID de la sesión.
     * @returns {Promise<Array>} Array de objetos de participantes.
     */
    static async getBySesionId(id_sesion_gasto) {
        try {
            // CAMBIO AQUÍ: Usamos COALESCE para PostgreSQL en lugar de ISNULL
            const result = await pool.query(
                `SELECT
                    ps.id,
                    ps.id_sesion_gasto,
                    ps.id_usuario,
                    COALESCE(u.nombre, ps.nombre_invitado) AS nombre_participante, -- Muestra nombre de usuario o invitado
                    ps.fecha_union
                FROM "ParticipanteSesion" ps
                LEFT JOIN "usuario" u ON ps.id_usuario = u.id
                WHERE ps.id_sesion_gasto = $1`,
                [id_sesion_gasto]
            );
            return result.rows; // CAMBIO AQUÍ: Los resultados están en 'rows'
        } catch (error) {
            console.error(`Error al obtener participantes para la sesión ${id_sesion_gasto} (PostgreSQL):`, error.message);
            throw error;
        }
    }

    /**
     * Obtiene un participante por su ID.
     * @param {number} id - ID del participante.
     * @returns {Promise<Object|undefined>} Objeto participante o undefined.
     */
    static async getById(id) {
        try {
            // CAMBIO AQUÍ: Usamos COALESCE para PostgreSQL
            const result = await pool.query(
                `SELECT
                    ps.id,
                    ps.id_sesion_gasto,
                    ps.id_usuario,
                    COALESCE(u.nombre, ps.nombre_invitado) AS nombre_participante,
                    ps.fecha_union
                FROM "ParticipanteSesion" ps
                LEFT JOIN "usuario" u ON ps.id_usuario = u.id
                WHERE ps.id = $1`,
                [id]
            );
            return result.rows[0]; // CAMBIO AQUÍ: Los resultados están en 'rows'
        } catch (error) {
            console.error(`Error al obtener participante con ID ${id} (PostgreSQL):`, error.message);
            throw error;
        }
    }
}

module.exports = ParticipanteSesion;
