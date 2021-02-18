import { ResultSetHeader } from 'mysql2';
import MySQL from '../init/MySQL';
import Model from './Model';
import User from './User';
import UserBlock from './UserBlock';
import UserLike from './UserLike';

export interface ChatInterface {
	id: number;
	user1: number;
	user2: number;
	start: string;
	last: string | null;
}

class Chat extends Model {
	static tname = 'chats';
	static table = `CREATE TABLE chats (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user1 INT UNSIGNED NOT NULL,
			user2 INT UNSIGNED NOT NULL,
			start DATETIME DEFAULT NOW(),
			last DATETIME DEFAULT NULL,
			UNIQUE KEY user1_user2_UNIQUE (user1, user2),
			FOREIGN KEY (user1) REFERENCES ${User.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (user2) REFERENCES ${User.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('chats', Chat);
	}

	static async get(id: number): Promise<ChatInterface | undefined> {
		const result = await Chat.query(`SELECT * FROM ${Chat.tname} WHERE id = ?`, [id]);
		if (result && result.length == 1) {
			return result[0];
		}
		return undefined;
	}

	static async getForUser(user: number, otherUser: number | string): Promise<ChatInterface | undefined> {
		const result = await Chat.query(
			`SELECT * FROM ${Chat.tname} WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?) LIMIT 1`,
			[user, otherUser, otherUser, user]
		);
		if (result && result.length == 1) {
			return result[0];
		}
		return undefined;
	}

	static getAll(id: number): Promise<ChatInterface[]> {
		return Chat.query(
			`SELECT c.* FROM ${Chat.tname} c
			LEFT JOIN ${UserBlock.tname} ub
				ON (ub.user = c.user1 AND ub.blocked = c.user2)
				OR (ub.user = c.user2 AND ub.blocked = c.user1)
			RIGHT JOIN ${UserLike.tname} ul1
				ON ul1.user = c.user1 AND ul1.liked = c.user2
			RIGHT JOIN ${UserLike.tname} ul2
				ON ul2.user = c.user2 AND ul2.liked = c.user1
			WHERE ub.id IS NULL AND (c.user1 = ? OR c.user2 = ?)
			ORDER BY c.last DESC`,
			[id, id]
		);
	}

	static updateLastMessage(id: number): Promise<ResultSetHeader> {
		return Chat.query(`UPDATE ${Chat.tname} SET last = NOW() WHERE id = ?`, [id]);
	}
}

export default Chat;
