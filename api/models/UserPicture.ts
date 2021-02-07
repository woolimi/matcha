import MySQL from '../init/MySQL';
import Model from './Model';
import fs from 'fs';
import path from 'path';

class UserPicture extends Model {
	static tname = 'user_pictures';
	static table = `CREATE TABLE user_pictures (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			picture TINYINT NOT NULL,
			path VARCHAR(100) NOT NULL,
			added DATETIME DEFAULT NOW(),
			FOREIGN KEY (user) REFERENCES users (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('user_pictures', UserPicture);
	}

	static async create_or_update(user_id: number, image_id: number, image_path: string): Promise<any> {
		try {
			let p = null;
			p = await UserPicture.query('SELECT * FROM user_pictures WHERE path = ? LIMIT 1', [image_path]);
			if (p.length > 0) {
				return UserPicture.query('UPDATE user_pictures SET added = NOW() WHERE path = ?', [image_path]);
			}

			p = await UserPicture.query('SELECT * FROM user_pictures WHERE user = ? AND picture = ? LIMIT 1', [
				user_id,
				image_id,
			]);
			if (p.length === 0) {
				await UserPicture.query('INSERT INTO `user_pictures` (`user`, `picture`, `path`) VALUES (?, ?, ?)', [
					user_id,
					image_id,
					image_path,
				]);
			} else {
				fs.unlink(path.resolve(__dirname, '../', p[0].path), (err) => {
					if (err) console.log(err);
				});
				await UserPicture.query(
					'UPDATE user_pictures SET added = NOW(), path = ? WHERE user = ? AND picture = ? ',
					[image_path, user_id, image_id]
				);
			}
		} catch (error) {
			throw error;
		}
	}
	static async get_images(user_id: number): Promise<any> {
		try {
			const images = await UserPicture.query('SELECT * FROM user_pictures WHERE user = ?', [user_id]);
			return [0, 1, 2, 3, 4].map((i) => {
				const img = images.find((img: any) => img.picture === i);
				return {
					url: img ? `${process.env.API}/${img.path}` : '',
					path: img ? img.path : '',
				};
			});
		} catch (error) {
			throw error;
		}
	}
	static async delete_image(user_id: number, image_id: number, image_path: string): Promise<any> {
		try {
			await UserPicture.query('DELETE FROM user_pictures WHERE user = ? AND picture = ?', [user_id, image_id]);
			fs.unlink(path.resolve(__dirname, '../', image_path), (err) => {
				if (err) console.log(err);
			});
		} catch (error) {
			throw error;
		}
	}
}

export default UserPicture;
