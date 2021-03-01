import mysql from 'mysql2/promise';

const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || 'root',
	database: process.env.DB_NAME || 'matcha',
	charset: 'utf8mb4_unicode_ci',
	connectionLimit: 30,
	timezone: 'Z',
});

export default {
	pool,
	CHARSET: 'utf8mb4',
	COLLATION: 'utf8mb4_unicode_ci',
};
