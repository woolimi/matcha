import mysql from 'mysql2';
import database from '../config/database.json';

class MySQL {
	static con = mysql.createConnection(database.MYSQL_CONFIG);

	static CHARSET = 'utf8mb4';
	static COLLATION = 'utf8mb4_unicode_ci';
}

export default MySQL;
