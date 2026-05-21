const mysql = require('mysql2/promise');

let pool;

async function init() {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || 'discordbot',
    waitForConnections: true,
    connectionLimit: 10,
  });
  await pool.query('SELECT 1');
  // Run same table definitions as sqlite (MySQL syntax)
}

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function run(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

async function get(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
}

module.exports = { init, query, run, get, raw: () => pool };
