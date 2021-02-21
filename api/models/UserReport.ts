import MySQL from '../init/MySQL';
import Model from './Model';
import User from './User';

class UserReport extends Model {
	static tname = 'user_reports';
	static table = `CREATE TABLE ${UserReport.tname} (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			reported INT UNSIGNED NOT NULL,
			at DATETIME DEFAULT NOW(),
			UNIQUE KEY user_reported_UNIQUE (user, reported),
			FOREIGN KEY (user) REFERENCES ${User.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (reported) REFERENCES ${User.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init(UserReport.tname, UserReport);
	}
}

export default UserReport;
