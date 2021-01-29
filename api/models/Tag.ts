import MySQL from '../init/MySQL';
import Model from './Model';
import { ResultSetHeader } from 'mysql2';

class Tag extends Model {
	static tname = 'tags';
	static table = `CREATE TABLE tags (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			UNIQUE KEY name_UNIQUE (name)
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('tags', Tag);
	}

	static async search(name: string): Promise<ResultSetHeader> {
		try {
			return await Tag.query(`SELECT * FROM ${this.table} WHERE name = ?`, [name]);
		} catch (error) {
			throw error;
		}
	}

	static async add(name: string): Promise<ResultSetHeader> {
		try {
			return await Tag.query(`INSERT INTO ${this.table} SET (name) VALUES (?)`, [name]);
		} catch (error) {
			throw error;
		}
	}
}

export default Tag;
