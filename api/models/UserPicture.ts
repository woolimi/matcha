import MySQL from '../init/MySQL';
import Model from './Model';
import fs from 'fs';
import path from 'path';

export interface UserPictureInterface {
	id: number;
	user: number;
	picture: number;
	path: string;
	added: string;
}

class UserPicture extends Model {
	static tname = 'user_pictures';
	static table = `CREATE TABLE user_pictures (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			picture TINYINT NOT NULL,
			path VARCHAR(255) NOT NULL,
			added DATETIME DEFAULT NOW(),
			FOREIGN KEY (user) REFERENCES users (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('user_pictures', UserPicture);
	}

	static async create_or_update(user_id: number, image_id: number, image_path: string): Promise<any> {
		try {
			let p = null;

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
				if (!p[0].path.match(/^https:\/\//)) {
					let resolve_path = '../';
					if (process.env.ENVIRONMENT === 'build') resolve_path += '../';
					fs.unlink(path.resolve(__dirname, resolve_path, p[0].path), (err) => {
						if (err) console.log(err);
					});
				}
				await UserPicture.query(
					'UPDATE user_pictures SET added = NOW(), path = ? WHERE user = ? AND picture = ? ',
					[image_path, user_id, image_id]
				);
			}
		} catch (error) {
			throw error;
		}
	}

	static async get_images(user_id: number): Promise<{ url: string; path: string }[]> {
		try {
			const images: UserPictureInterface[] = await UserPicture.query(
				'SELECT * FROM user_pictures WHERE user = ?',
				[user_id]
			);
			return [0, 1, 2, 3, 4].map((i) => {
				const img = images.find((img) => img.picture === i);
				const ret = {
					url: '',
					path: '',
				};
				if (!img) return ret;
				if (img.path.match(/^https:\/\//)) ret.url = img.path;
				else if (img.path) ret.url = `${process.env.API}/${img.path}`;
				ret.path = img.path;
				return ret;
			});
		} catch (error) {
			throw error;
		}
	}

	static async delete_image(user_id: number, image_id: number, image_path: string): Promise<any> {
		try {
			await UserPicture.query('DELETE FROM user_pictures WHERE user = ? AND picture = ?', [user_id, image_id]);
			if (!image_path.match(/^https:\/\//)) {
				let resolve_path = '../';
				if (process.env.ENVIRONMENT === 'build') resolve_path += '../';
				fs.unlink(path.resolve(__dirname, resolve_path, image_path), (err) => {
					if (err) console.log(err);
				});
			}
		} catch (error) {
			throw error;
		}
	}
}

export default UserPicture;
