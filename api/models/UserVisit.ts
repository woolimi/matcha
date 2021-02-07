import MySQL from '../init/MySQL';
import Model from './Model';
import User from './User';

class UserVisit extends Model {
	static tname = 'user_visits';
	static table = `CREATE TABLE user_visits (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			visited INT UNSIGNED NOT NULL,
			visitor INT UNSIGNED NOT NULL,
			at DATETIME DEFAULT NOW(),
			FOREIGN KEY (visited) REFERENCES ${User.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (visitor) REFERENCES ${User.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('user_visits', UserVisit);
	}
}

export default UserVisit;
