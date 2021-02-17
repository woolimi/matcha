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

	static async check(user: number, blocked: number): Promise<UserBlockInterface | null> {
		const result: UserBlockInterface[] = await UserBlock.query(
			`SELECT * FROM ${UserBlock.tname} WHERE user = ? AND blocked = ? LIMIT 1`,
			[user, blocked]
		);
		if (result && result.length == 1) {
			return result[0];
		}
		return null;
	}

	static add(user: number, blocked: number): Promise<ResultSetHeader> {
		return UserBlock.query(`INSERT INTO ${UserBlock.tname} (user, block) VALUES (?, ?)`, [user, blocked]);
	}
}

export default UserBlock;
