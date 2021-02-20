import MySQL from '../init/MySQL';
import Model from './Model';

class UserReport extends Model {
	static tname = 'user_reports';
	static table = `CREATE TABLE user_reports (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			reported INT UNSIGNED NOT NULL,
			at DATETIME DEFAULT NOW(),
			UNIQUE KEY user_reported_UNIQUE (user, reported),
			FOREIGN KEY (user) REFERENCES ${UserReport.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (reported) REFERENCES ${UserReport.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('user_reports', UserReport);
	}
}

export default UserReport;
