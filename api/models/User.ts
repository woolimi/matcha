import MySQL from '../init/MySQL';
import Model from './Model';
import bcrypt from 'bcrypt';
import { RegisterForm, PublicInfoForm } from '../init/Interfaces';
import _ from 'lodash';
import { ll2xy, xy2ll } from '../services/Location';
import { LocationLL } from '../init/Interfaces';
import UserPicture from './UserPicture';
import { ResultSetHeader } from 'mysql2';

class User extends Model {
	static tname = 'users';
	static table = `CREATE TABLE users (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			email VARCHAR(60) NOT NULL,
			username VARCHAR(20) NOT NULL,
			password VARCHAR(100) NOT NULL,
			lastName VARCHAR(45) NOT NULL,
			firstName VARCHAR(45) NOT NULL,
			verified TINYINT DEFAULT '0',
			initialized TINYINT DEFAULT '0',
			gender ENUM('male','female') DEFAULT NULL,
			preferences ENUM('heterosexual','bisexual') DEFAULT NULL,
			biography TEXT DEFAULT NULL,
			location POINT SRID 4326 NOT NULL,
			UNIQUE KEY email_UNIQUE (email),
			UNIQUE KEY username_UNIQUE (username)
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('users', User);
	}

	static async updatePublic(user_id: number, formData: PublicInfoForm) {
		const conn = await MySQL.pool.getConnection();
		try {
			await conn.query('START TRANSACTION');
			await conn.query(
				'UPDATE users SET firstName = ?, lastName = ?, gender = ?, preferences = ?, biography = ? WHERE id = ?',
				[
					formData.firstName,
					formData.lastName,
					formData.gender,
					formData.preferences,
					formData.biography,
					user_id,
				]
			);
			for (const tag of formData.tags) {
				await conn.query('INSERT IGNORE INTO tags (`name`) VALUES (?)', [tag]);
			}
			await conn.query('DELETE FROM user_tags WHERE user = ?', user_id);
			for (const tag of formData.tags) {
				const [rows, fields]: [any, any] = await conn.query('SELECT * FROM tags WHERE name = ? LIMIT 1', [tag]);
				await conn.query('INSERT INTO user_tags (`user`, `tag`) VALUES (?, ?)', [user_id, rows[0].id]);
			}
			await conn.query('COMMIT');
		} catch (error) {
			await conn.query('ROLLBACK');
			throw error;
		}
		await conn.release();
	}

	static async register(formData: RegisterForm): Promise<any> {
		try {
			const data = { ...formData };
			data.password = await bcrypt.hash(formData.password, 10);
			const xy = ll2xy(data.location);
			return await User.query(
				'INSERT INTO `users` (`email`, `username`, `password`, `lastName`, `firstName`, `verified`, `location`) VALUES (?, ?, ?, ?, ?, false, ST_SRID(POINT(?, ?), 4326))',
				[data.email, data.username, data.password, data.firstName, data.lastName, xy.x, xy.y]
			);
		} catch (error) {
			throw error;
		}
	}

	static async me(id: number) {
		try {
			const user = await User.find(id);
			user.location = xy2ll(user.location);
			user.images = await UserPicture.get_images(user.id);
			return _.pick(user, ['id', 'email', 'username', 'lastName', 'firstName', 'verified', 'location', 'images']);
		} catch (error) {
			throw error;
		}
	}

	static async updateLocation(ll: LocationLL) {
		try {
			const xy = ll2xy(ll);
			await User.query('UPDATE users SET location = ST_SRID(POINT(?, ?), 4326)', [xy.x, xy.y]);
		} catch (error) {
			throw error;
		}
	}
}

export default User;
