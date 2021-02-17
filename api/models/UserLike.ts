import { ResultSetHeader } from 'mysql2';
import MySQL from '../init/MySQL';
import Model from './Model';
import User from './User';

export interface UserLikeInterface {
	id: number;
	user: number;
	liked: number;
	at: string;
}

export const enum UserLikeStatus {
	// No like on either sides
	NONE,
	// user is liking liked
	ONEWAY,
	// both users like each others
	TWOWAY,
	// liked is liking user
	REVERSE,
}

class UserLike extends Model {
	static tname = 'user_likes';
	static table = `CREATE TABLE user_likes (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			liked INT UNSIGNED NOT NULL,
			at DATETIME DEFAULT NOW(),
			UNIQUE KEY user_liked_UNIQUE (user, liked),
			FOREIGN KEY (user) REFERENCES ${User.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (liked) REFERENCES ${User.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('user_likes', UserLike);
	}

	static async status(user1: number, user2: number): Promise<UserLikeStatus> {
		const list: UserLikeInterface[] = await UserLike.query(
			`SELECT * FROM ${UserLike.tname} WHERE (user = ? AND liked = ?) OR (liked = ? AND user = ?) LIMIT 2`,
			[user1, user2, user1, user2]
		);
		let likeStatus = UserLikeStatus.TWOWAY;
		if (list.length == 0) {
			likeStatus = UserLikeStatus.NONE;
		} else if (list.length == 1) {
			likeStatus = list[0].user == user1 ? UserLikeStatus.ONEWAY : UserLikeStatus.REVERSE;
		}
		return likeStatus;
	}

	static add(user1: number, user2: number): Promise<ResultSetHeader> {
		return UserLike.query(`INSERT INTO ${UserLike.tname} (user, liked) VALUES (?, ?)`, [user1, user2]);
	}

	static remove(user1: number, user2: number): Promise<ResultSetHeader> {
		return UserLike.query(`DELETE FROM ${UserLike.tname} WHERE user = ? AND liked = ?`, [user1, user2]);
	}
}

export default UserLike;
