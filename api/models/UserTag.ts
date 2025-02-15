import MySQL from '../init/MySQL';
import Model from './Model';

export interface UserTagInterface {
	id: number;
	user: number;
	tag: number;
	added: string;
}

class UserTag extends Model {
	static tname = 'user_tags';
	static table = `CREATE TABLE user_tags (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			tag INT UNSIGNED NOT NULL,
			added DATETIME DEFAULT NOW(),
			UNIQUE KEY user_tag_UNIQUE (user, tag),
			FOREIGN KEY (user) REFERENCES users (id) ON DELETE CASCADE,
			FOREIGN KEY (tag) REFERENCES tags (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('user_tags', UserTag);
	}

	static async get_tags(user_id: number): Promise<string[]> {
		try {
			const rows: {
				name: string;
			}[] = await UserTag.query(
				'SELECT tags.name AS name FROM user_tags \
				LEFT JOIN users ON user_tags.user = users.id \
				LEFT JOIN tags ON user_tags.tag = tags.id \
				WHERE user_tags.user = ?',
				[user_id]
			);
			return rows.map((tag) => tag.name);
		} catch (error) {
			throw error;
		}
	}

	static async add_tag(user_id: number, tag_id: number) {
		try {
			await UserTag.query('INSERT IGNORE INTO user_tags (`user`, `tag`) VALUES (?, ?)', [user_id, tag_id]);
		} catch (error) {
			throw error;
		}
	}
}

export default UserTag;
