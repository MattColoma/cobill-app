// backend/src/models/sesionGastoModel.js

const pool = require('../config/db');

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
            const result = await pool.query(
                `INSERT INTO "SesionGasto" (codigo_gasto, nombre_sesion, id_usuario_creador, porcentaje_propina)
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [codigo_gasto, nombre_sesion, id_usuario_creador, porcentaje_propina]
            );
            return {
                id: result.rows[0].id,
                codigo_gasto,
                nombre_sesion,
                id_usuario_creador,
                porcentaje_propina
            };
        } catch (error) {
            console.error("Error al crear una nueva sesión de gasto (PostgreSQL):", error.message);
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
            console.log('Modelo: Buscando sesión con código:', codigo_gasto);
            const result = await pool.query(
                'SELECT id, codigo_gasto, nombre_sesion, fecha_creacion, estado, id_usuario_creador, porcentaje_propina FROM "SesionGasto" WHERE codigo_gasto = $1',
                [codigo_gasto]
            );
            console.log('Resultado de la consulta:', result.rows);
            return result.rows[0];
        } catch (error) {
            console.error(`Error en el modelo getByCodigo para ${codigo_gasto} (PostgreSQL):`, error.message);
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
            const result = await pool.query(
                'SELECT id, codigo_gasto, nombre_sesion, fecha_creacion, estado, id_usuario_creador, porcentaje_propina FROM "SesionGasto" WHERE id = $1',
                [id]
            );
            return result.rows[0];
        } catch (error) {
            console.error(`Error al obtener sesión de gasto con ID ${id} (PostgreSQL):`, error.message);
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
            let query = 'UPDATE "SesionGasto" SET ';
            const updates = [];
            const values = [];
            let paramIndex = 1;

            if (estado !== null) {
                updates.push(`estado = $${paramIndex++}`);
                values.push(estado);
            }
            if (porcentaje_propina !== null) {
                updates.push(`porcentaje_propina = $${paramIndex++}`);
                values.push(porcentaje_propina);
            }

            if (updates.length === 0) {
                return false;
            }

            query += updates.join(', ') + ` WHERE id = $${paramIndex++}`;
            values.push(id);

            const result = await pool.query(query, values);
            return result.rowCount > 0;
        } catch (error) {
            console.error(`Error al actualizar sesión de gasto con ID ${id} (PostgreSQL):`, error.message);
            throw error;
        }
    }
}

module.exports = SesionGasto;
