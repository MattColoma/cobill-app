// backend/src/models/sesionGastoModel.js

const sql = require('mssql');
const pool = require('../config/db'); // Ruta al archivo db.js

class SesionGasto {
    /**
     * Crea una nueva sesión de gasto.
     * @param {string} codigo_gasto - Código único para la sesión.
     * @param {string} [nombre_sesion] - Nombre opcional de la sesión.
     * @param {number} [id_usuario_creador] - ID del usuario creador (opcional).
     * @param {number} [porcentaje_propina=10.00] - Porcentaje de propina.
     * @returns {Promise<Object>} El objeto de la sesión creada con su ID.
     */
    static async create(codigo_gasto, nombre_sesion = null, id_usuario_creador = null, porcentaje_propina = 10.00) {
        try {
            const request = pool.request();
            request.input('codigo_gasto', sql.NVarChar(10), codigo_gasto);
            request.input('nombre_sesion', sql.NVarChar(255), nombre_sesion);
            request.input('id_usuario_creador', sql.Int, id_usuario_creador);
            request.input('porcentaje_propina', sql.Decimal(5,2), porcentaje_propina);

            const result = await request.query(`
                INSERT INTO SesionGasto (codigo_gasto, nombre_sesion, id_usuario_creador, porcentaje_propina)
                VALUES (@codigo_gasto, @nombre_sesion, @id_usuario_creador, @porcentaje_propina);
                SELECT SCOPE_IDENTITY() AS id;
            `);
            return {
                id: result.recordset[0].id,
                codigo_gasto,
                nombre_sesion,
                id_usuario_creador,
                porcentaje_propina
            };
        } catch (error) {
            console.error("Error al crear una nueva sesión de gasto:", error.message);
            throw error;
        }
    }

    /**
     * Obtiene una sesión de gasto por su código.
     * @param {string} codigo_gasto - El código de la sesión.
     * @returns {Promise<Object|undefined>} El objeto de la sesión si se encuentra, o undefined.
     */
    static async getByCodigo(codigo_gasto) {
        try {
            const request = pool.request();
            request.input('codigo_gasto', sql.NVarChar(10), codigo_gasto);
            const result = await request.query('SELECT id, codigo_gasto, nombre_sesion, fecha_creacion, estado, id_usuario_creador, porcentaje_propina FROM SesionGasto WHERE codigo_gasto = @codigo_gasto');
            return result.recordset[0];
        } catch (error) {
            console.error(`Error al obtener sesión de gasto con código ${codigo_gasto}:`, error.message);
            throw error;
        }
    }

    /**
     * Obtiene una sesión de gasto por su ID.
     * @param {number} id - El ID de la sesión.
     * @returns {Promise<Object|undefined>} El objeto de la sesión si se encuentra, o undefined.
     */
    static async getById(id) {
        try {
            const request = pool.request();
            request.input('id', sql.Int, id);
            const result = await request.query('SELECT id, codigo_gasto, nombre_sesion, fecha_creacion, estado, id_usuario_creador, porcentaje_propina FROM SesionGasto WHERE id = @id');
            return result.recordset[0];
        } catch (error) {
            console.error(`Error al obtener sesión de gasto con ID ${id}:`, error.message);
            throw error;
        }
    }

    /**
     * Actualiza el estado o el porcentaje de propina de una sesión.
     * @param {number} id - ID de la sesión a actualizar.
     * @param {string} [estado] - Nuevo estado de la sesión.
     * @param {number} [porcentaje_propina] - Nuevo porcentaje de propina.
     * @returns {Promise<boolean>} True si se actualizó, false en caso contrario.
     */
    static async update(id, estado = null, porcentaje_propina = null) {
        try {
            const request = pool.request();
            let query = 'UPDATE SesionGasto SET ';
            const updates = [];

            if (estado !== null) {
                updates.push('estado = @estado');
                request.input('estado', sql.NVarChar(50), estado);
            }
            if (porcentaje_propina !== null) {
                updates.push('porcentaje_propina = @porcentaje_propina');
                request.input('porcentaje_propina', sql.Decimal(5,2), porcentaje_propina);
            }

            if (updates.length === 0) {
                return false; // No hay nada que actualizar
            }

            query += updates.join(', ') + ' WHERE id = @id';
            request.input('id', sql.Int, id);

            const result = await request.query(query);
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error(`Error al actualizar sesión de gasto con ID ${id}:`, error.message);
            throw error;
        }
    }
}

module.exports = SesionGasto;
