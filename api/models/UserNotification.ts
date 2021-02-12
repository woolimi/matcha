import { ResultSetHeader } from 'mysql2';
import MySQL from '../init/MySQL';
import Model from './Model';
import User from './User';

export const enum Notification {
	Visit = 'profile:visited',
	MessageReceived = 'message:received',
	LikeReceived = 'like:received',
	LikeMatched = 'like:match',
	LikeRemoved = 'like:removed',
}

export interface NotificationInterface {
	id: number;
	user: number;
	type: Notification;
	at: string;
	sender: number;
	status: boolean;
}

class UserNotification extends Model {
	static tname = 'user_notifications';
	static table = `CREATE TABLE user_notifications (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			type ENUM('profile:visited', 'message:received', 'like:received', 'like:match', 'like:removed') NOT NULL,
			at DATETIME DEFAULT NOW(),
			sender INT UNSIGNED NULL,
			status TINYINT UNSIGNED DEFAULT '0',
			FOREIGN KEY (user) REFERENCES ${User.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (sender) REFERENCES ${User.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('user_notifications', UserNotification);
	}

	static async get(id: number): Promise<NotificationInterface | undefined> {
		const result = await UserNotification.query(`SELECT * FROM ${UserNotification.tname} WHERE id = ?`, [id]);
		if (result && result.length == 1) {
			return result[0];
		}
		return undefined;
	}

	static async getLast(user: number): Promise<NotificationInterface | undefined> {
		const result = await UserNotification.query(
			`SELECT * FROM ${UserNotification.tname} WHERE user = ? ORDER BY id DESC LIMIT 1`,
			[user]
		);
		if (result && result.length == 1) {
			return result[0];
		}
		return undefined;
	}

	static async getLastMessage(user: number, sender: number): Promise<NotificationInterface | undefined> {
		const result = await UserNotification.query(
			`SELECT * FROM ${UserNotification.tname} WHERE user = ? AND sender = ? AND type = '${Notification.MessageReceived}' ORDER BY id DESC LIMIT 1`,
			[user, sender]
		);
		if (result && result.length == 1) {
			return result[0];
		}
		return undefined;
	}

	static getAll(id: number): Promise<NotificationInterface[]> {
		return UserNotification.query(`SELECT * FROM ${UserNotification.tname} WHERE user = ? ORDER BY id DESC`, [id]);
	}

	static async add(user: number, sender: number, type: Notification): Promise<ResultSetHeader | false> {
		try {
			return UserNotification.query(
				`INSERT INTO ${UserNotification.tname} (user, type, sender) VALUES (?, ?, ?)`,
				[user, type, sender]
			) as Promise<ResultSetHeader>;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	static setAsRead(id: number): Promise<ResultSetHeader> {
		return UserNotification.query(`UPDATE ${UserNotification.tname} SET status = 1 WHERE id = ?`, [id]);
	}

	static setAllAsRead(user: number): Promise<ResultSetHeader> {
		return UserNotification.query(`UPDATE ${UserNotification.tname} SET status = 1 WHERE user = ?`, [user]);
	}
}

export default UserNotification;
