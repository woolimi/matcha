import MySQL from "../init/MySQL";

interface ModelClass {
	table: string;
}

class Model {
	static query(sql: string) {
		return new Promise((resolve, reject) => {
			if (!MySQL.con) reject("MySQL is not connected.");
			MySQL.con.query(sql, (error, result) => {
				if (error) reject(error);
				else resolve(result);
			});
		});
	}
	static async init(modelName: string, modelClass: ModelClass): Promise<any> {
		try {
			const hasTable: any = await this.query(
				"SHOW TABLES FROM `matcha` LIKE 'users'",
			);
			if (hasTable.length > 0)
				return console.log(`⚡️[server]: Table '${modelName}' already exist`);
			await this.query(modelClass.table);
			console.log(`⚡️[server]: Table '${modelName}' created`);
		} catch (error) {
			console.log(error);
		}
	}
}

export default Model;
