import MySQL from '../init/MySQL';
import Model from './Model';
import { ResultSetHeader } from 'mysql2';
import User from './User';

class UserNotification extends Model {
	static tname = 'user_notifications';
	static table = `CREATE TABLE user_notifications (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			type ENUM('profile:visited', 'message:received', 'like:received', 'like:match', 'like:removed') NOT NULL,
			content TEXT NOT NULL,
			at DATETIME DEFAULT NOW(),
			FOREIGN KEY (user) REFERENCES ${User.tname} (id) ON DELETE CASCADE,
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('user_notifications', UserNotification);
	}
}

export default UserNotification;
