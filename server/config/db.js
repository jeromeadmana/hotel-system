const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Parse the DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL.replace('?ssl-mode=REQUIRED', ''));

const pool = mysql.createPool({
  host: dbUrl.hostname,
  port: dbUrl.port,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.substring(1), // Remove leading slash
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false // Required for Aiven's self-signed certificate
  }
});

const promisePool = pool.promise();

module.exports = promisePool;
