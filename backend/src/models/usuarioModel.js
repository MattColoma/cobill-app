// backend/src/models/usuarioModel.js

const sql = require('mssql');
const pool = require('../config/db');
const bcrypt = require('bcryptjs'); // Importar bcryptjs para hashear contraseñas

class Usuario {
    /**
     * Obtiene todos los usuarios de la base de datos.
     * @returns {Promise<Array>} Un array de objetos de usuario (sin la contraseña).
     */
    static async getAll() {
        try {
            const request = pool.request();
            // No seleccionar la contraseña para getAll por seguridad
            const result = await request.query('SELECT id, nombre, email, fecha_registro FROM usuario');
            return result.recordset;
        } catch (error) {
            console.error("Error al obtener todos los usuarios:", error.message);
            throw error;
        }
    }

    /**
     * Obtiene un usuario por su ID.
     * @param {number} id - El ID del usuario a buscar.
     * @returns {Promise<Object|undefined>} El objeto de usuario si se encuentra (sin la contraseña), o undefined.
     */
    static async getById(id) {
        try {
            const request = pool.request();
            request.input('id', sql.Int, id);
            // No seleccionar la contraseña para getById por seguridad
            const result = await request.query('SELECT id, nombre, email, fecha_registro FROM usuario WHERE id = @id');
            return result.recordset[0];
        } catch (error) {
            console.error(`Error al obtener usuario con ID ${id}:`, error.message);
            throw error;
        }
    }

    /**
     * Obtiene un usuario por su email.
     * Este método es crucial para la autenticación, ya que permite verificar las credenciales.
     * @param {string} email - El email del usuario a buscar.
     * @returns {Promise<Object|undefined>} El objeto de usuario si se encuentra (incluyendo la contraseña hasheada), o undefined.
     */
    static async getByEmail(email) {
        try {
            const request = pool.request();
            request.input('email', sql.NVarChar, email);
            // Aquí sí seleccionamos la contraseña para poder compararla
            const result = await request.query('SELECT id, nombre, email, password, fecha_registro FROM usuario WHERE email = @email');
            return result.recordset[0];
        } catch (error) {
            console.error(`Error al obtener usuario por email ${email}:`, error.message);
            throw error;
        }
    }

    /**
     * Crea un nuevo usuario en la base de datos con la contraseña hasheada.
     * @param {string} nombre - El nombre del usuario.
     * @param {string} email - El email del usuario (debe ser único).
     * @param {string} password - La contraseña del usuario (se hasheará antes de guardar).
     * @returns {Promise<Object>} Un objeto con el ID del nuevo usuario y sus datos (sin la contraseña hasheada).
     */
    static async create(nombre, email, password) {
        try {
            // Hashear la contraseña antes de guardarla en la base de datos
            const salt = await bcrypt.genSalt(10); // Generar un "salt" (cadena aleatoria)
            const hashedPassword = await bcrypt.hash(password, salt); // Hashear la contraseña con el salt

            const request = pool.request();
            request.input('nombre', sql.NVarChar, nombre);
            request.input('email', sql.NVarChar, email);
            request.input('password', sql.NVarChar, hashedPassword); // Guardar la contraseña hasheada
            
            const result = await request.query(`
                INSERT INTO usuario (nombre, email, password)
                VALUES (@nombre, @email, @password);
                SELECT SCOPE_IDENTITY() AS id;
            `);
            // Retornar el usuario sin la contraseña hasheada por seguridad
            return { id: result.recordset[0].id, nombre, email };
        } catch (error) {
            console.error("Error al crear un nuevo usuario:", error.message);
            throw error;
        }
    }

    /**
     * Actualiza la información de un usuario existente (sin cambiar la contraseña).
     * @param {number} id - El ID del usuario a actualizar.
     * @param {string} nombre - El nuevo nombre del usuario.
     * @param {string} email - El nuevo email del usuario.
     * @returns {Promise<boolean>} True si el usuario fue actualizado, false en caso contrario.
     */
    static async update(id, nombre, email) {
        try {
            const request = pool.request();
            request.input('id', sql.Int, id);
            request.input('nombre', sql.NVarChar, nombre);
            request.input('email', sql.NVarChar, email);
            const result = await request.query('UPDATE usuario SET nombre = @nombre, email = @email WHERE id = @id');
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error(`Error al actualizar usuario con ID ${id}:`, error.message);
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
            const request = pool.request();
            request.input('id', sql.Int, id);
            const result = await request.query('DELETE FROM usuario WHERE id = @id');
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error(`Error al eliminar usuario con ID ${id}:`, error.message);
            throw error;
        }
    }
}

module.exports = Usuario;
