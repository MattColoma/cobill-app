// backend/src/models/usuarioModel.js

// CAMBIO AQUÍ: Importamos el pool de conexiones de PostgreSQL
const pool = require('../config/db');
const bcrypt = require('bcryptjs'); // Necesario para hashear y comparar contraseñas

class Usuario {
    /**
     * Obtiene todos los usuarios de la base de datos.
     * @returns {Promise<Array>} Un array de objetos de usuario.
     */
    static async getAll() {
        try {
            // CAMBIO AQUÍ: Usamos pool.query directamente para PostgreSQL
            const result = await pool.query('SELECT id, nombre, email, fecha_registro FROM usuario');
            return result.rows; // CAMBIO AQUÍ: Los resultados están en 'rows' para pg
        } catch (error) {
            console.error("Error al obtener todos los usuarios (PostgreSQL):", error.message);
            throw error;
        }
    }

    /**
     * Obtiene un usuario por su ID.
     * @param {number} id - El ID del usuario a buscar.
     * @returns {Promise<Object|undefined>} El objeto de usuario si se encuentra, o undefined.
     */
    static async getById(id) {
        try {
            // CAMBIO AQUÍ: Usamos placeholders $1, $2, etc., y pasamos los valores en un array
            const result = await pool.query('SELECT id, nombre, email, fecha_registro FROM usuario WHERE id = $1', [id]);
            return result.rows[0]; // Retorna el primer resultado (o undefined si no hay)
        } catch (error) {
            console.error(`Error al obtener usuario con ID ${id} (PostgreSQL):`, error.message);
            throw error;
        }
    }

    /**
     * Obtiene un usuario por su dirección de email.
     * @param {string} email - La dirección de email del usuario a buscar.
     * @returns {Promise<Object|undefined>} El objeto de usuario si se encuentra, o undefined.
     */
    static async getByEmail(email) {
        try {
            const result = await pool.query('SELECT id, nombre, email, password, fecha_registro FROM usuario WHERE email = $1', [email]);
            return result.rows[0];
        } catch (error) {
            console.error(`Error al obtener usuario con email ${email} (PostgreSQL):`, error.message);
            throw error;
        }
    }

    /**
     * Crea un nuevo usuario en la base de datos.
     * @param {string} nombre - El nombre del usuario.
     * @param {string} email - La dirección de email del usuario.
     * @param {string} plainPassword - La contraseña sin hashear.
     * @returns {Promise<Object>} Un objeto con el ID del nuevo usuario y sus datos.
     */
    static async create(nombre, email, plainPassword) {
        try {
            // Hashear la contraseña antes de guardarla
            const hashedPassword = await bcrypt.hash(plainPassword, 10); // 10 es el costo del salt

            // CAMBIO AQUÍ: PostgreSQL usa RETURNING id para obtener el ID generado
            const result = await pool.query(
                'INSERT INTO usuario (nombre, email, password) VALUES ($1, $2, $3) RETURNING id',
                [nombre, email, hashedPassword]
            );
            // El ID generado está en result.rows[0].id
            return { id: result.rows[0].id, nombre, email };
        } catch (error) {
            console.error("Error al crear un nuevo usuario (PostgreSQL):", error.message);
            throw error;
        }
    }

    /**
     * Actualiza un usuario existente por su ID.
     * @param {number} id - El ID del usuario a actualizar.
     * @param {string} nombre - El nuevo nombre del usuario.
     * @param {string} email - La nueva dirección de email del usuario.
     * @returns {Promise<boolean>} True si el usuario fue actualizado, false en caso contrario.
     */
    static async update(id, nombre, email) {
        try {
            const result = await pool.query(
                'UPDATE usuario SET nombre = $1, email = $2 WHERE id = $3',
                [nombre, email, id]
            );
            // rowCount indica cuántas filas fueron afectadas por la operación
            return result.rowCount > 0;
        } catch (error) {
            console.error(`Error al actualizar usuario con ID ${id} (PostgreSQL):`, error.message);
            throw error;
        }
    }

    /**
     * Elimina un usuario por su ID.
     * @param {number} id - El ID del usuario a eliminar.
     * @returns {Promise<boolean>} True si el usuario fue eliminado, false en caso contrario.
     */
    static async delete(id) {
        try {
            const result = await pool.query('DELETE FROM usuario WHERE id = $1', [id]);
            return result.rowCount > 0;
        } catch (error) {
            console.error(`Error al eliminar usuario con ID ${id} (PostgreSQL):`, error.message);
            throw error;
        }
    }
}

module.exports = Usuario;
