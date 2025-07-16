// backend/src/models/participanteSesionModel.js

const sql = require('mssql');
const pool = require('../config/db'); // Ruta al archivo db.js

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
            const request = pool.request();
            request.input('id_sesion_gasto', sql.Int, id_sesion_gasto);
            request.input('id_usuario', sql.Int, id_usuario);
            request.input('nombre_invitado', sql.NVarChar(100), nombre_invitado);

            const result = await request.query(`
                INSERT INTO ParticipanteSesion (id_sesion_gasto, id_usuario, nombre_invitado)
                VALUES (@id_sesion_gasto, @id_usuario, @nombre_invitado);
                SELECT SCOPE_IDENTITY() AS id;
            `);
            return {
                id: result.recordset[0].id,
                id_sesion_gasto,
                id_usuario,
                nombre_invitado
            };
        } catch (error) {
            console.error("Error al crear un nuevo participante de sesión:", error.message);
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
            const request = pool.request();
            request.input('id_sesion_gasto', sql.Int, id_sesion_gasto);
            const result = await request.query(`
                SELECT
                    ps.id,
                    ps.id_sesion_gasto,
                    ps.id_usuario,
                    ISNULL(u.nombre, ps.nombre_invitado) AS nombre_participante, -- Muestra nombre de usuario o invitado
                    ps.fecha_union
                FROM ParticipanteSesion ps
                LEFT JOIN usuario u ON ps.id_usuario = u.id
                WHERE ps.id_sesion_gasto = @id_sesion_gasto
            `);
            return result.recordset;
        } catch (error) {
            console.error(`Error al obtener participantes para la sesión ${id_sesion_gasto}:`, error.message);
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
            const request = pool.request();
            request.input('id', sql.Int, id);
            const result = await request.query(`
                SELECT
                    ps.id,
                    ps.id_sesion_gasto,
                    ps.id_usuario,
                    ISNULL(u.nombre, ps.nombre_invitado) AS nombre_participante,
                    ps.fecha_union
                FROM ParticipanteSesion ps
                LEFT JOIN usuario u ON ps.id_usuario = u.id
                WHERE ps.id = @id
            `);
            return result.recordset[0];
        } catch (error) {
            console.error(`Error al obtener participante con ID ${id}:`, error.message);
            throw error;
        }
    }
}

module.exports = ParticipanteSesion;
