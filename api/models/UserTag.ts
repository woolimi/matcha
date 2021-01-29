import MySQL from '../init/MySQL';
import Model from './Model';
import { ResultSetHeader } from 'mysql2';
import User from './User';
import Tag from './Tag';

class UserTag extends Model {
	static tname = 'user_tags';
	static table = `CREATE TABLE user_tags (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			tag INT UNSIGNED NOT NULL,
			added DATETIME DEFAULT NOW(),
			UNIQUE KEY user_tag_UNIQUE (user, tag),
			FOREIGN KEY (user) REFERENCES ${User.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (tag) REFERENCES ${Tag.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('user_tags', UserTag);
	}
}

export default UserTag;
