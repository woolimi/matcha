import { ResultSetHeader } from 'mysql2';
import MySQL from '../init/MySQL';
import Model from './Model';
import User from './User';

export interface UserBlockInterface {
	id: number;
	user: number;
	blocked: number;
	at: string;
}

export class UserBlock extends Model {
	static tname = 'user_blocks';
	static table = `CREATE TABLE user_blocks (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			blocked INT UNSIGNED NOT NULL,
			at DATETIME DEFAULT NOW(),
			UNIQUE KEY user_blocked_UNIQUE (user, blocked),
			FOREIGN KEY (user) REFERENCES ${User.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (blocked) REFERENCES ${User.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('user_blocks', UserBlock);
	}

	static getAll(id: number): Promise<UserBlockInterface[]> {
		return UserBlock.query(`SELECT * FROM ${UserBlock.tname} WHERE user = ? ORDER BY id DESC`, [id]);
	}

	static async status(user: number, blocked: number): Promise<number> {
		const result: {
			id: number;
		}[] = await UserBlock.query(`SELECT id FROM ${UserBlock.tname} WHERE user = ? AND blocked = ? LIMIT 1`, [
			user,
			blocked,
		]);
		if (result && result.length == 1) {
			return result[0].id;
		}
		return 0;
	}

	static add(user: number, blocked: number): Promise<ResultSetHeader> {
		return UserBlock.query(`INSERT INTO ${UserBlock.tname} (user, blocked) VALUES (?, ?)`, [user, blocked]);
	}

	static remove(id: number): Promise<ResultSetHeader> {
		return UserBlock.query(`DELETE FROM ${UserBlock.tname} WHERE id = ?`, [id]);
	}
}

export default UserBlock;
