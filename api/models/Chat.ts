import MySQL from '../init/MySQL';
import Model from './Model';
import { ResultSetHeader } from 'mysql2';
import User from './User';

class Chat extends Model {
	static tname = 'chats';
	static table = `CREATE TABLE chats (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user1 INT UNSIGNED NOT NULL,
			user2 INT UNSIGNED NOT NULL,
			start DATETIME DEFAULT NOW(),
			UNIQUE KEY user1_user2_UNIQUE (user1, user2),
			FOREIGN KEY (user1) REFERENCES ${User.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (user2) REFERENCES ${User.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('chats', Chat);
	}
}

export default Chat;
