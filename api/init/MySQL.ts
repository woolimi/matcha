import mysql from "mysql2";
import database from "../config/database.json";
import User from "../models/User";

class MySQL {
	static con = mysql.createConnection(database.MYSQL_CONFIG);
	static init() {
		const con = MySQL.con;
		con.connect((err) => {
			if (err) throw err;
			console.log("⚡️[server]: Connected to MYSQL Server");
			User.init();
		});
	}
}

export default MySQL;
