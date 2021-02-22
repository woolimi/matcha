import { ResultSetHeader } from 'mysql2';
import MySQL from '../init/MySQL';
import Model from './Model';
import User from './User';

export interface UserReportInterface {
	id: number;
	user: number;
	reported: number;
	at: string;
}

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

	static async get(user: number, reported: number): Promise<UserReportInterface | undefined> {
		const result: UserReportInterface[] = await UserReport.query(
			`SELECT * FROM ${UserReport.tname} WHERE user = ? AND reported = ? LIMIT 1`,
			[user, reported]
		);
		if (result && result.length == 1) {
			return result[0];
		}
		return undefined;
	}

	static add(user: number, reported: number): Promise<ResultSetHeader> {
		return UserReport.query(`INSERT INTO ${UserReport.tname} (user, reported) VALUES (?, ?)`, [user, reported]);
	}

	static remove(id: number): Promise<ResultSetHeader> {
		return UserReport.query(`DELETE FROM ${UserReport.tname} WHERE id = ?`, [id]);
	}
}

export default UserReport;
