const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

const envResult = dotenv.config();

console.log("ENV file loaded:", !envResult.error);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PASSWORD loaded:", Boolean(process.env.DB_PASSWORD));
console.log("DB_PASSWORD length:", process.env.DB_PASSWORD?.length);

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_workout_tracker',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;