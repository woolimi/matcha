import MySQL from '../init/MySQL';
import Model from './Model';
import { ResultSetHeader } from 'mysql2';
import User from './User';

class UserPicture extends Model {
	static tname = 'user_pictures';
	static table = `CREATE TABLE user_pictures (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			extension VARCHAR(10) NOT NULL,
			added DATETIME DEFAULT NOW(),
			FOREIGN KEY (user) REFERENCES ${User.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('user_pictures', UserPicture);
	}
}

export default UserPicture;
