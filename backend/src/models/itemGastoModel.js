// backend/src/models/itemGastoModel.js

const pool = require('../config/db');

class ItemGasto {
    /**
     * Agrega un nuevo ítem de gasto a un participante de sesión.
     * @param {number} id_participante_sesion - ID del participante que agrega el ítem.
     * @param {string} descripcion_item - Descripción del ítem.
     * @param {number} costo_item - Costo del ítem.
     * @returns {Promise<Object>} El objeto del ítem creado con su ID.
     */
    static async create(id_participante_sesion, descripcion_item, costo_item) {
        try {
            // CAMBIO AQUÍ: PostgreSQL usa RETURNING id para obtener el ID generado
            const result = await pool.query(
                `INSERT INTO "ItemGasto" (id_participante_sesion, descripcion_item, costo_item)
                 VALUES ($1, $2, $3) RETURNING id`,
                [id_participante_sesion, descripcion_item, costo_item]
            );
            return {
                id: result.rows[0].id, // CAMBIO AQUÍ: El ID está en result.rows[0].id
                id_participante_sesion,
                descripcion_item,
                costo_item
            };
        } catch (error) {
            console.error("Error al crear un nuevo ítem de gasto (PostgreSQL):", error.message);
            throw error;
        }
    }

    /**
     * Obtiene todos los ítems de gasto para un participante específico.
     * @param {number} id_participante_sesion - ID del participante.
     * @returns {Promise<Array>} Array de objetos de ítems de gasto.
     */
    static async getByParticipanteId(id_participante_sesion) {
        try {
            const result = await pool.query(
                'SELECT id, descripcion_item, costo_item, fecha_registro FROM "ItemGasto" WHERE id_participante_sesion = $1',
                [id_participante_sesion]
            );
            // CAMBIO AQUÍ: Convertir costo_item a float
            return result.rows.map(item => ({
                ...item,
                costo_item: parseFloat(item.costo_item)
            }));
        } catch (error) {
            console.error(`Error al obtener ítems para el participante ${id_participante_sesion} (PostgreSQL):`, error.message);
            throw error;
        }
    }

    /**
     * Obtiene todos los ítems de gasto para una sesión completa.
     * Incluye información del participante y la sesión.
     * @param {number} id_sesion_gasto - ID de la sesión.
     * @returns {Promise<Array>} Array de objetos de ítems con detalles.
     */
    static async getBySesionId(id_sesion_gasto) {
        try {
            // CAMBIO AQUÍ: Usamos COALESCE para PostgreSQL en lugar de ISNULL
            const result = await pool.query(
                `SELECT
                    ig.id,
                    ig.descripcion_item,
                    ig.costo_item,
                    ig.fecha_registro,
                    ps.id AS participante_id,
                    COALESCE(u.nombre, ps.nombre_invitado) AS nombre_participante,
                    sg.codigo_gasto,
                    sg.porcentaje_propina
                FROM "ItemGasto" ig
                JOIN "ParticipanteSesion" ps ON ig.id_participante_sesion = ps.id
                JOIN "SesionGasto" sg ON ps.id_sesion_gasto = sg.id
                LEFT JOIN "usuario" u ON ps.id_usuario = u.id
                WHERE ps.id_sesion_gasto = $1
                ORDER BY ps.id, ig.fecha_registro;`,
                [id_sesion_gasto]
            );
            // CAMBIO AQUÍ: Convertir costo_item a float
            return result.rows.map(item => ({
                ...item,
                costo_item: parseFloat(item.costo_item)
            }));
        } catch (error) {
            console.error(`Error al obtener ítems para la sesión ${id_sesion_gasto} (PostgreSQL):`, error.message);
            throw error;
        }
    }

    /**
     * Calcula el total de gastos de un participante en una sesión.
     * @param {number} id_participante_sesion - ID del participante.
     * @returns {Promise<number>} El costo total del participante.
     */
    static async getTotalByParticipante(id_participante_sesion) {
        try {
            const result = await pool.query(
                'SELECT SUM(costo_item) AS total FROM "ItemGasto" WHERE id_participante_sesion = $1',
                [id_participante_sesion]
            );
            // CAMBIO AQUÍ: Los resultados de agregación están en result.rows[0]
            return parseFloat(result.rows[0].total) || 0; // Retorna 0 si no hay ítems
        } catch (error) {
            console.error(`Error al calcular total para participante ${id_participante_sesion} (PostgreSQL):`, error.message);
            throw error;
        }
    }

    /**
     * Calcula el total de gastos de una sesión completa, incluyendo propina.
     * @param {number} id_sesion_gasto - ID de la sesión.
     * @returns {Promise<Object>} Un objeto con el total_sin_propina, porcentaje_propina y total_con_propina.
     */
    static async getTotalBySesion(id_sesion_gasto) {
        try {
            const result = await pool.query(
                `SELECT
                    SUM(ig.costo_item) AS total_sin_propina,
                    sg.porcentaje_propina
                FROM "ItemGasto" ig
                JOIN "ParticipanteSesion" ps ON ig.id_participante_sesion = ps.id
                JOIN "SesionGasto" sg ON ps.id_sesion_gasto = sg.id
                WHERE ps.id_sesion_gasto = $1
                GROUP BY sg.porcentaje_propina;`,
                [id_sesion_gasto]
            );

            if (result.rows.length === 0) {
                return { total_sin_propina: 0, porcentaje_propina: 0, total_con_propina: 0 };
            }

            const { total_sin_propina, porcentaje_propina } = result.rows[0];
            const propina_monto = (parseFloat(total_sin_propina) * parseFloat(porcentaje_propina)) / 100;
            const total_con_propina = parseFloat(total_sin_propina) + propina_monto;

            return {
                total_sin_propina: parseFloat(total_sin_propina),
                porcentaje_propina: parseFloat(porcentaje_propina),
                total_con_propina: parseFloat(total_con_propina.toFixed(2))
            };
        } catch (error) {
            console.error(`Error al calcular total para sesión ${id_sesion_gasto} (PostgreSQL):`, error.message);
            throw error;
        }
    }
}

module.exports = ItemGasto;
