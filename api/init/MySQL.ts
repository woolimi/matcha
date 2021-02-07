import { connect } from 'http2';
import mysql from 'mysql2/promise';
import database from '../config/database.json';

const pool = mysql.createPool(database.MYSQL_CONFIG);

export default {
	pool,
	CHARSET: 'utf8mb4',
	COLLATION: 'utf8mb4_unicode_ci',
};
