import MySQL from '../init/MySQL';
import Model from './Model';

class UserLanguage extends Model {
	static tname = 'user_languages';
	static table = `CREATE TABLE user_languages (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			language VARCHAR(50) NOT NULL,
			UNIQUE KEY user_language_UNIQUE (user, language),
			FOREIGN KEY (user) REFERENCES users (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('user_languages', UserLanguage);
	}
	static async get_languages(user_id: number) {
		try {
			const rows = await UserLanguage.query(
				'SELECT language FROM user_languages \
			LEFT JOIN users ON user_languages.user = users.id \
			WHERE user_languages.user = users.id'
			);
			return rows.map((l: any) => l.language);
		} catch (error) {
			throw error;
		}
	}
}

export default UserLanguage;
