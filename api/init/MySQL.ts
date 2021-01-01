import mysql from "mysql2";
import database from "../config/database.json";

class MySQL {
	static con = mysql.createConnection(database.MYSQL_CONFIG);
	static init() {
		this.con.connect((err) => {
			if (err) throw err;
			console.log("⚡️[server]: Connected to MYSQL Server");
		});
	}
}

// create tables....
// add dummy data...
// mysql wrapper (ORM)

export default MySQL;
