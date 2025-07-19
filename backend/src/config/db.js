// backend/src/config/db.js

/*require('dotenv').config(); // Asegúrate de cargar las variables de entorno

// CAMBIO AQUÍ: Usamos el módulo 'pg' para PostgreSQL
const { Pool } = require('pg');

// Configuración de conexión a la base de datos PostgreSQL
const dbConfig = {
    user: process.env.DB_USER,        // Tu usuario de PostgreSQL (ej. 'postgres')
    password: process.env.DB_PASSWORD,    // Tu contraseña de PostgreSQL
    host: process.env.DB_HOST,        // Por defecto 'localhost'
    port: process.env.DB_PORT,        // Por defecto 5432
    database: process.env.DB_NAME     // El nombre de tu base de datos (ej. 'cobill_pg')
    // ssl: { rejectUnauthorized: false } // Solo si usas SSL y no confías en el certificado (para despliegue en la nube)
};

// Crea un pool de conexiones para PostgreSQL
const pool = new Pool(dbConfig);

// Test de conexión a la base de datos
pool.connect()
    .then(client => {
        console.log('Pool de conexión a PostgreSQL inicializado y conectado.');
        client.release(); // Libera el cliente de vuelta al pool
    })
    .catch(err => {
        console.error('Error al conectar el pool de base de datos PostgreSQL:', err.message);
        // No salimos de la aplicación aquí, el error se propagará si no se maneja en los modelos
    });

// Exporta el pool de conexiones para que otros módulos puedan usarlo
module.exports = pool;*/

// backend/src/config/db.js
const { Pool } = require('pg');

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10), // Asegúrate de que el puerto sea un número
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false // NECESARIO para Render y muchos proveedores de DB en la nube
    }
};

const pool = new Pool(dbConfig);

pool.connect()
    .then(client => {
        console.log('Pool de conexión a PostgreSQL inicializado y conectado.');
        client.release();
    })
    .catch(err => {
        console.error('Error al conectar el pool de base de datos PostgreSQL:', err.message);
    });

module.exports = pool;
