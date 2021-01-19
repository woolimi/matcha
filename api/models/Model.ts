import MySQL from '../init/MySQL';
import { ResultSetHeader } from 'mysql2';

interface ModelClass {
	table: string;
}

export const CHARSET = 'utf8mb4';
export const COLLATION = 'utf8mb4_unicode_ci';

class Model {
	static tname = 'null';
	static query(sql: string, placeholder?: Array<any>): Promise<ResultSetHeader | any> {
		return new Promise((resolve, reject) => {
			if (!MySQL.con) reject('MySQL is not connected.');
			MySQL.con.query(sql, placeholder, (error, result: ResultSetHeader) => {
				if (error) reject(error);
				else resolve(result);
			});
		});
	}
	static async init(modelName: string, modelClass: ModelClass): Promise<any> {
		try {
			const hasTable: any = await this.query("SHOW TABLES FROM `matcha` LIKE 'users'");
			if (hasTable.length > 0) return console.log(`⚡️[server]: Table '${modelName}' already exist`);
			await Model.query(modelClass.table);
			console.log(`⚡️[server]: Table '${modelName}' created`);
		} catch (error) {
			console.log(error);
		}
	}
	static async find(id: number) {
		try {
			console.log(this.tname);
			const rows = await Model.query(`SELECT * FROM ${this.tname} WHERE id = ?`, [id]);
			return rows[0];
		} catch (error) {
			console.log(`Model find() ${this.tname} : ${error}`);
			throw error;
		}
	}
}

export default Model;
