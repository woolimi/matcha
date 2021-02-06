import MySQL from '../init/MySQL';
import Model from './Model';
import User from './User';

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

	static async get(id: number): Promise<ChatInterface | null> {
		const result = await Chat.query(`SELECT * FROM ${Chat.tname} WHERE id = ?`, [id]);
		if (result && result.length == 1) {
			return result[0];
		}
		return null;
	}

	static getAllForUser(id: number): Promise<ChatInterface[]> {
		return Chat.query(`SELECT * FROM ${Chat.tname} WHERE user1 = ? OR user2 = ?`, [id, id]);
	}
}

export default Chat;
