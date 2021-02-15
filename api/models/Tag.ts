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
			return await Tag.query(`SELECT * FROM ${this.tname} WHERE name = ?`, [name]);
		} catch (error) {
			throw error;
		}
	}

	static async add(name: string): Promise<ResultSetHeader> {
		try {
			return await Tag.query('INSERT IGNORE INTO tags (`name`) VALUES (?)', [name]);
		} catch (error) {
			throw error;
		}
	}

	static async get_tags() {
		try {
			const rows = await Tag.query('SELECT name FROM tags');
			return rows.map((tag: any) => tag.name);
		} catch (error) {
			throw error;
		}
	}

	static async get_tag_ids() {
		try {
			const rows = await Tag.query('SELECT id FROM tags');
			return rows.map((tag: any) => tag.id);
		} catch (error) {
			throw error;
		}
	}
}

export default Tag;
