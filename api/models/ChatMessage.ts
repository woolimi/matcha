import MySQL from '../init/MySQL';
import Model from './Model';
import { ResultSetHeader } from 'mysql2';
import Chat from './Chat';
import User from './User';

export interface ChatMessageInterface {
	id: number;
	chat: number;
	sender: number;
	at: string;
	content: string;
}

class ChatMessage extends Model {
	static tname = 'chat_messages';
	static table = `CREATE TABLE chat_messages (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			chat INT UNSIGNED NOT NULL,
			sender INT UNSIGNED NOT NULL,
			at DATETIME DEFAULT NOW(),
			content TEXT NOT NULL,
			FOREIGN KEY (chat) REFERENCES ${Chat.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (sender) REFERENCES ${User.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('chat_messages', ChatMessage);
	}

	static async add(chat: number, sender: number, content: string): Promise<ResultSetHeader | false> {
		try {
			return (await ChatMessage.query(
				`INSERT INTO ${ChatMessage.tname} (chat, sender, content) VALUES (?, ?, ?)`,
				[chat, sender, content]
			)) as ResultSetHeader;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	static async get(id: number): Promise<ChatMessageInterface | null> {
		const result = await ChatMessage.query(`SELECT * FROM ${ChatMessage.tname} WHERE id = ?`, [id]);
		if (result && result.length == 1) {
			return result[0];
		}
		return null;
	}

	static getAll(id: number): Promise<ChatMessageInterface[]> {
		return ChatMessage.query(`SELECT * FROM ${ChatMessage.tname} WHERE chat = ?`, [id]);
	}
}

export default ChatMessage;
