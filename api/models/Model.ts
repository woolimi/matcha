import MySQL from '../init/MySQL';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface ModelClass {
	table: string;
}

abstract class Model {
	static tname = 'null';

	static async query(sql: string, placeholder?: Array<any>): Promise<any | ResultSetHeader> {
		if (sql.match(/(^update)|(^delete)|(^insert)/i)) {
			const result = await MySQL.pool.query(sql, placeholder);
			return result[0];
		}
		const [rows, fields] = await MySQL.pool.query(sql, placeholder);
		return rows;
	}

	static async init(modelName: string, modelClass: ModelClass): Promise<any> {
		try {
			const hasTable: any = await this.query(`SHOW TABLES FROM matcha LIKE '${modelName}'`);
			if (hasTable.length > 0) return console.log(`⚡️[server]: Table '${modelName}' already exist`);
			await Model.query(modelClass.table);
			console.log(`⚡️[server]: Table '${modelName}' created`);
		} catch (error) {
			console.log(error);
		}
	}

	static async find(id: number) {
		try {
			const rows = await Model.query(`SELECT * FROM ${this.tname} WHERE id = ? LIMIT 1`, [id]);
			if (rows.length < 1) throw 'User not found';
			return rows[0];
		} catch (error) {
			throw error;
		}
	}
}

export default Model;
