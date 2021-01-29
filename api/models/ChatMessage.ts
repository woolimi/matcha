import MySQL from '../init/MySQL';
import Model from './Model';
import { ResultSetHeader } from 'mysql2';
import Chat from './Chat';
import User from './User';

class ChatMessage extends Model {
	static tname = 'chat_messages';
	static table = `CREATE TABLE chat_messages (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			chat INT UNSIGNED NOT NULL,
			sender INT UNSIGNED NOT NULL,
			at DATETIME DEFAULT NOW(),
			content TEXT DEFAULT NOT NULL,
			FOREIGN KEY (chat) REFERENCES ${Chat.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (sender) REFERENCES ${User.tname} (id) ON DELETE CASCADE,
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('chat_messages', ChatMessage);
	}
}

export default ChatMessage;
