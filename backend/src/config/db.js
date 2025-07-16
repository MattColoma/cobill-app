// backend/src/config/db.js

require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const pool = new sql.ConnectionPool(dbConfig);

pool.connect()
    .then(() => {
        console.log('Pool de conexión a SQL Server inicializado y conectado.');
    })
    .catch(err => {
        console.error('Error al conectar el pool de base de datos SQL Server:', err.message);
    });

module.exports = pool; // ¡MUY IMPORTANTE EXPORTAR EL POOL AQUÍ!