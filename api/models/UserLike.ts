import MySQL from '../init/MySQL';
import Model from './Model';
import { ResultSetHeader } from 'mysql2';
import User from './User';

class UserLike extends Model {
	static tname = 'user_likes';
	static table = `CREATE TABLE user_likes (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			like INT UNSIGNED NOT NULL,
			at DATETIME DEFAULT NOW(),
			UNIQUE user_like_UNIQUE (user, like),
			FOREIGN KEY (user) REFERENCES ${User.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (like) REFERENCES ${User.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('user_likes', UserLike);
	}
}

export default UserLike;
