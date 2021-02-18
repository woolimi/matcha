import MySQL from '../init/MySQL';
import Model from './Model';
import bcrypt from 'bcrypt';
import { RegisterForm, PublicInfoForm, ChangePasswordForm } from '../init/Interfaces';
import _ from 'lodash';
import { ll2xy, xy2ll } from '../services/Location';
import { LocationLL } from '../init/Interfaces';
import UserPicture from './UserPicture';
import UserTag from './UserTag';
import UserLanguage from './UserLanguage';

export interface UserInterface {
	id: number;
	email: string;
	username: string;
	password: string;
	lastName: string;
	firstName: string;
	verified: number;
	initialized: number;
	gender: ('male' | 'female') | null;
	preferences: ('heterosexual' | 'bisexual') | null;
	biography: string | null;
	location: { x: number; y: number } | null;
	birthdate: string | null;
}

export type UserInterfaceLocation = UserInterface | { location: { lat: number; lng: number } | null };

export type UserSimpleInterface = Pick<UserInterface, 'id' | 'firstName' | 'lastName'> & {
	picture: string | null;
	online: boolean | undefined;
};

export type PublicProfileInterface = Pick<
	UserInterface,
	'id' | 'firstName' | 'lastName' | 'gender' | 'preferences' | 'biography' | 'location' | 'birthdate'
>;

class User extends Model {
	static tname = 'users';
	static table = `CREATE TABLE users (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			email VARCHAR(60) NOT NULL,
			username VARCHAR(20) NOT NULL,
			password VARCHAR(100) NOT NULL,
			firstName VARCHAR(45) NOT NULL,
			lastName VARCHAR(45) NOT NULL,
			verified TINYINT DEFAULT '0',
			initialized TINYINT DEFAULT '0',
			gender ENUM('male','female') DEFAULT NULL,
			preferences ENUM('heterosexual','bisexual') DEFAULT NULL,
			biography TEXT DEFAULT NULL,
			location POINT SRID 4326 NOT NULL,
			birthdate DATETIME DEFAULT NULL,
			UNIQUE KEY email_UNIQUE (email),
			UNIQUE KEY username_UNIQUE (username)
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('users', User);
	}

	static async me(id: number) {
		try {
			const user = await User.find(id);
			user.location = xy2ll(user.location);
			user.images = await UserPicture.get_images(user.id);
			user.tags = await UserTag.get_tags(user.id);
			user.languages = await UserLanguage.get_languages(user.id);
			return _.pick(user, [
				'id',
				'email',
				'username',
				'lastName',
				'firstName',
				'verified',
				'gender',
				'preferences',
				'location',
				'images',
				'tags',
				'biography',
				'languages',
				'birthdate',
			]);
		} catch (error) {
			throw error;
		}
	}

	static async updatePublic(user_id: number, formData: PublicInfoForm) {
		const conn = await MySQL.pool.getConnection();
		try {
			await conn.query('START TRANSACTION');
			await conn.query(
				'UPDATE users SET firstName = ?, lastName = ?, gender = ?, preferences = ?, biography = ?, birthdate = ? WHERE id = ?',
				[
					formData.firstName,
					formData.lastName,
					formData.gender,
					formData.preferences,
					formData.biography,
					formData.birthdate,
					user_id,
				]
			);
			// tag
			for (const tag of formData.tags) {
				await conn.query('INSERT IGNORE INTO tags (`name`) VALUES (?)', [tag]);
			}
			await conn.query('DELETE FROM user_tags WHERE user = ?', user_id);
			for (const tag of formData.tags) {
				const [rows, fields]: [any, any] = await conn.query('SELECT * FROM tags WHERE name = ? LIMIT 1', [tag]);
				await conn.query('INSERT INTO user_tags (`user`, `tag`) VALUES (?, ?)', [user_id, rows[0].id]);
			}
			// language
			await conn.query('DELETE FROM user_languages WHERE user = ?', user_id);
			for (const lang of formData.languages) {
				await conn.query('INSERT INTO user_languages (`user`, `language`) VALUES (?, ?)', [user_id, lang]);
			}
			await conn.query('COMMIT');
			await conn.release();
		} catch (error) {
			await conn.query('ROLLBACK');
			await conn.release();
			throw error;
		}
	}

	static async register(formData: RegisterForm): Promise<any> {
		try {
			const data = { ...formData };
			data.password = await bcrypt.hash(formData.password, 10);
			const xy = ll2xy(data.location);
			return await User.query(
				'INSERT INTO `users` (`email`, `username`, `password`, `lastName`, `firstName`, `verified`, `location`) \
				VALUES (?, ?, ?, ?, ?, false, ST_SRID(POINT(?, ?), 4326))',
				[data.email, data.username, data.password, data.firstName, data.lastName, xy.x, xy.y]
			);
		} catch (error) {
			throw error;
		}
	}

	static mainPictureUrl(path: string | null): string {
		if (path && path.match(/^https:\/\//)) return path;
		return `${process.env.API}/${path}`;
	}

	static async getSimple(id: number): Promise<UserSimpleInterface | null> {
		const result: UserSimpleInterface[] = await User.query(
			`SELECT u.id, u.firstName, u.lastName, p.path as picture
			FROM ${User.tname} as u
			LEFT JOIN user_pictures as p ON p.user = u.id
			WHERE u.id = ?
			LIMIT 1`,
			[id]
		);
		if (result && result.length == 1) {
			return result[0];
		}
		return null;
	}

	static async create_fake_user(user: any): Promise<any> {
		try {
			return await User.query(
				'INSERT INTO `users` (`email`, `username`, `password`, `lastName`, `firstName`, `gender`, `preferences`, `biography`, `birthdate`, `location`, `verified`) \
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ST_SRID(POINT(?, ?), 4326), true)',
				[
					user.email,
					user.username,
					user.password,
					user.lastName,
					user.firstName,
					user.gender,
					user.preferences,
					user.biography,
					user.birthdate,
					user.lng,
					user.lat,
				]
			);
		} catch (error) {
			throw error;
		}
	}

	static async getAllSimple(ids: number[]): Promise<UserSimpleInterface[]> {
		try {
			if (ids.length === 0) return [];
			const users: UserSimpleInterface[] = await User.query(
				`SELECT u.id, u.firstName, u.lastName, p.path as picture \
				FROM ${User.tname} as u \
				LEFT JOIN user_pictures as p ON p.user = u.id \
				WHERE u.id IN (${new Array(ids.length).fill('?').join(',')})`,
				[...ids]
			);
			return users.map((user) => {
				return { ...user, online: false, picture: User.mainPictureUrl(user.picture) };
			});
		} catch (error) {
			throw error;
		}
	}

	static async getPublicProfile(id: number): Promise<UserInterfaceLocation | null> {
		const result: UserInterfaceLocation[] = await User.query(
			`SELECT id, firstName, lastName, gender, preferences, biography, location, birthdate \
			FROM ${User.tname} \
			WHERE id = ? LIMIT 1`,
			[id]
		);
		if (result && result.length == 1) {
			const profile = result[0]!;
			const location = profile.location as { x: number; y: number };
			profile.location = { lat: location.y, lng: location.x };
			return profile;
		}
		return null;
	}

	static async exists(id: number): Promise<boolean> {
		const result: { id: number }[] = await User.query(`SELECT id FROM ${User.tname} WHERE id = ? LIMIT 1`, [id]);
		if (result && result.length == 1) return true;
		return false;
	}

	static async updateLocation(ll: LocationLL) {
		try {
			const xy = ll2xy(ll);
			await User.query('UPDATE users SET location = ST_SRID(POINT(?, ?), 4326)', [xy.x, xy.y]);
		} catch (error) {
			throw error;
		}
	}

	static async changePassword(pwForm: ChangePasswordForm) {
		try {
			const data = { ...pwForm };
			data.password = await bcrypt.hash(pwForm.password, 10);
			return await User.query('UPDATE users SET password = ?', [data.password]);
		} catch (error) {
			throw error;
		}
	}
}

export default User;
