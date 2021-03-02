import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	charset: 'utf8mb4_unicode_ci',
	connectionLimit: 30,
	timezone: 'Z',
});

export default {
	pool,
	CHARSET: 'utf8mb4',
	COLLATION: 'utf8mb4_unicode_ci',
};
