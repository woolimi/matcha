import MySQL from '../init/MySQL';
import Model from './Model';
import bcrypt from 'bcrypt';
import { RegisterForm, PublicInfoForm, ChangePasswordForm, SearchQuery } from '../init/Interfaces';
import _ from 'lodash';
import { ll2xy, xy2ll } from '../services/Location';
import { LocationLL, LocationXY } from '../init/Interfaces';
import UserPicture from './UserPicture';
import UserTag from './UserTag';
import UserLanguage from './UserLanguage';
import { ResultSetHeader } from 'mysql2';

export interface UserInterfaceBase {
	id: number;
	email: string;
	username: string;
	password: string;
	lastName: string;
	firstName: string;
	verified: number;
	fame: number;
	gender: ('male' | 'female') | null;
	preferences: ('heterosexual' | 'homosexual' | 'bisexual') | null;
	biography: string | null;
	birthdate: string | null;
	login: string | null;
}

export type UserInterfaceXY = UserInterfaceBase & { location: { x: number; y: number } | null };
export type UserInterfaceLL = UserInterfaceBase & { location: { lat: number; lng: number } | null };

export type UserSimpleInterface = Pick<UserInterfaceBase, 'id' | 'firstName' | 'lastName' | 'login'> & {
	picture: string | null;
	online: string | boolean;
};

export type PublicProfileInterface = Pick<
	UserInterfaceLL,
	| 'id'
	| 'firstName'
	| 'lastName'
	| 'fame'
	| 'gender'
	| 'preferences'
	| 'biography'
	| 'location'
	| 'birthdate'
	| 'login'
>;

class User extends Model {
	static tname = 'users';
	static table = `CREATE TABLE users (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			email VARCHAR(60) NOT NULL,
			username VARCHAR(30) NOT NULL,
			password VARCHAR(100) NOT NULL,
			firstName VARCHAR(45) NOT NULL,
			lastName VARCHAR(45) NOT NULL,
			verified TINYINT DEFAULT '0',
			fame INT UNSIGNED DEFAULT '0',
			gender ENUM('male','female') DEFAULT NULL,
			preferences ENUM('heterosexual','homosexual','bisexual') DEFAULT 'bisexual',
			biography TEXT DEFAULT NULL,
			location POINT SRID 4326 NOT NULL,
			birthdate DATETIME DEFAULT NULL,
			login DATETIME DEFAULT NULL,
			provider VARCHAR(10) DEFAULT 'local',
			provider_id VARCHAR(255) DEFAULT NULL,
			reset_password_token VARCHAR(255) DEFAULT NULL,
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
				'fame',
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
				'UPDATE users SET username = ?, firstName = ?, lastName = ?, gender = ?, preferences = ?, biography = ?, birthdate = ? WHERE id = ?',
				[
					formData.username,
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
			formData.tags = _.union(formData.tags.map((t) => t.toLowerCase()));
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
				'INSERT INTO `users` (`email`, `username`, `password`, `firstName`, `lastName`, `verified`, `location`) \
				VALUES (?, ?, ?, ?, ?, false, ST_SRID(POINT(?, ?), 4326))',
				[data.email, data.username, data.password, data.firstName, data.lastName, xy.x, xy.y]
			);
		} catch (error) {
			throw error;
		}
	}

	static async register_google(formData: RegisterForm): Promise<number> {
		try {
			const data = { ...formData };
			const user = await User.query('SELECT * FROM users WHERE provider = ? AND provider_id = ? LIMIT 1', [
				data.provider,
				data.provider_id,
			]);
			if (user.length === 1) return user[0].id;
			data.password = await bcrypt.hash(formData.password, 10);
			const xy = ll2xy(data.location);
			await Model.query(`START TRANSACTION`);
			const {
				insertId,
			} = await User.query(
				'INSERT INTO `users` (`email`, `username`, `password`,`firstName`, `lastName`,  `verified`, `location`, `provider`, `provider_id`) \
					VALUES (?, ?, ?, ?, ?, ?, ST_SRID(POINT(?, ?), 4326), ?, ?)',
				[
					data.email,
					data.username,
					data.password,
					data.firstName,
					data.lastName,
					data.verified,
					xy.x,
					xy.y,
					data.provider,
					data.provider_id,
				]
			);
			await UserPicture.query('INSERT INTO `user_pictures` (`user`, `picture`, `path`) VALUES (?, ?, ?)', [
				insertId,
				0,
				data.picture,
			]);
			await Model.query('COMMIT');
			return insertId;
		} catch (error) {
			await Model.query('ROLLBACK');
			throw error;
		}
	}

	static mainPictureUrl(path: string | null): string {
		if (path && path.match(/^https:\/\//)) return path;
		return `${process.env.API}/${path}`;
	}

	static async getSimple(id: number): Promise<UserSimpleInterface | null> {
		const result: UserSimpleInterface[] = await User.query(
			`SELECT u.id, u.firstName, u.lastName, u.login, p.path as picture
			FROM ${User.tname} as u
			LEFT JOIN user_pictures as p ON p.user = u.id
			WHERE u.id = ?
			LIMIT 1`,
			[id]
		);
		if (result && result.length == 1) {
			return { ...result[0], picture: User.mainPictureUrl(result[0].picture) };
		}
		return null;
	}

	static async create_fake_user(user: any): Promise<any> {
		try {
			return await User.query(
				'INSERT INTO `users` (`email`, `username`, `password`, `lastName`, `firstName`, `gender`, `preferences`, `biography`, `birthdate`, `location`, `verified`, `fame`, `login`) \
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ST_SRID(POINT(?, ?), 4326), true, ?, ?)',
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
					user.fame,
					user.login,
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
				`SELECT u.id, u.firstName, u.lastName, u.login, p.path as picture
				FROM ${User.tname} as u
				LEFT JOIN user_pictures as p ON p.user = u.id
				WHERE u.id IN (${this.arrayPlaceholder(ids)})`,
				[...ids]
			);
			return users.map((user) => {
				return { ...user, online: false, picture: User.mainPictureUrl(user.picture) };
			});
		} catch (error) {
			throw error;
		}
	}

	static updateFame(id: number, amount: number): Promise<ResultSetHeader> {
		return User.query(`UPDATE ${User.tname} SET fame = fame + ? WHERE id = ?`, [amount, id]);
	}

	static async getPublicProfile(id: number): Promise<UserInterfaceLL | null> {
		const result: UserInterfaceXY[] = await User.query(
			`SELECT id, firstName, lastName, fame, gender, preferences, biography, location, birthdate, login
			FROM ${User.tname}
			WHERE id = ? LIMIT 1`,
			[id]
		);
		if (result && result.length == 1) {
			const profile = result[0]!;
			return { ...profile, location: xy2ll(profile.location!) };
		}
		return null;
	}

	static async exists(id: number): Promise<boolean> {
		const result: { id: number }[] = await User.query(`SELECT id FROM ${User.tname} WHERE id = ? LIMIT 1`, [id]);
		if (result && result.length == 1) return true;
		return false;
	}

	static async updateLocation(id: number, ll: LocationLL) {
		try {
			const xy = ll2xy(ll);
			await User.query('UPDATE users SET location = ST_SRID(POINT(?, ?), 4326) WHERE id = ?', [xy.x, xy.y, id]);
		} catch (error) {
			throw error;
		}
	}

	static async changePassword(user_id: number, pwForm: ChangePasswordForm) {
		try {
			const data = { ...pwForm };
			data.password = await bcrypt.hash(pwForm.password, 10);
			return await User.query('UPDATE users SET password = ? WHERE id = ?', [data.password, user_id]);
		} catch (error) {
			throw error;
		}
	}

	static updateLastLogin(id: number) {
		return User.query('UPDATE users SET login = NOW() WHERE id = ?', [id]);
	}

	static async search(user_id: number, query: SearchQuery) {
		// 1. filter not verified and not fill public info.
		try {
			const { preferences, location, gender } = await User.find(user_id);

			let preferences_query = '';
			if (preferences === 'heterosexual') {
				preferences_query = `gender = '${gender === 'male' ? 'female' : 'male'}'`;
			} else if (preferences === 'homosexual') {
				preferences_query = `gender = '${gender === 'male' ? 'male' : 'female'}'`;
			} else if (preferences === 'bisexual') {
				if (gender === 'male')
					preferences_query = `(gender = 'female' OR (gender = 'male' AND preferences = 'bisexual'))`;
				else preferences_query = `(gender = 'male' OR (gender = 'female' AND preferences = 'bisexual'))`;
			}
			let users = [];
			if (query.tags.length) users = await User.search_with_tags(user_id, location, preferences_query, query);
			else users = await User.search_without_tags(user_id, location, preferences_query, query);

			return users.map((u: any) => ({ ...u, location: xy2ll(u.location), image: User.mainPictureUrl(u.image) }));
		} catch (error) {
			throw error;
		}
	}

	static invalid_user_filter_query = `AND users.verified = 1
		AND users.gender IS NOT NULL
		AND users.preferences IS NOT NULL
		AND users.birthdate IS NOT NULL
		AND users.biography IS NOT NULL`;

	static common_select_query() {
		return `users.id, username, lastName, firstName, gender, preferences, birthdate, biography, location,
			uinfo.age, ROUND(uinfo.distance) AS distance, fame, upictures.path AS image,
			CONCAT(LPAD(ROUND(uinfo.distance), 5, '0'), LPAD(users.id, 5, '0')) AS distance_cursor,
			CONCAT(LPAD(IFNULL(fame, 0), 5, '0'), LPAD(users.id, 5, '0')) AS fame_cursor,
			CONCAT(LPAD(uinfo.age, 3, '0'), LPAD(users.id, 5, '0')) AS age_cursor,
			block_list.blocked,
			report_list.reported_count,
			IFNULL(is_liked.liked, false) as is_liked,
			IFNULL(is_liking.user, false) as is_liking`;
	}

	static arrayPlaceholder(array: any[]): string {
		return new Array(array.length).fill('?').join(',');
	}

	static common_join_placeholders(userId: number): number[] {
		return [userId, userId, userId];
	}

	/**
	 * Added placeholders: [User.id, User.id, User.id, languages]
	 */
	static common_join_query(languages: string[]) {
		return `
			LEFT JOIN (
				SELECT user_reports.reported, COUNT(user_reports.reported) AS reported_count
				FROM user_reports
				GROUP BY user_reports.reported
			) AS report_list
			ON users.id = report_list.reported
			LEFT JOIN (
				SELECT user_likes.liked
				FROM user_likes
				WHERE user_likes.user = ?
				GROUP BY user_likes.liked
			) AS is_liked
			ON users.id = is_liked.liked
			LEFT JOIN (
				SELECT user_likes.user
				FROM user_likes
				WHERE user_likes.liked = ?
				GROUP BY user_likes.user
			) AS is_liking
			ON users.id = is_liking.user
			LEFT JOIN (
				SELECT user_blocks.user, user_blocks.blocked
				FROM user_blocks
				WHERE user_blocks.user = ?
			) AS block_list
			ON users.id = block_list.blocked
			INNER JOIN (
				SELECT id AS user, ST_Distance_Sphere(location, ST_GeomFromText('POINT(? ?)', 4326))/1000 AS distance, timestampdiff(YEAR, birthdate, CURDATE()) AS age
				FROM users
			) AS uinfo
			ON users.id = uinfo.user
			INNER JOIN (
				SELECT user_pictures.user, user_pictures.path
				FROM user_pictures
				WHERE user_pictures.picture = 0
			) AS upictures
			ON users.id = upictures.user
			INNER JOIN (
				SELECT user_languages.user, user_languages.language
				FROM user_languages
				WHERE user_languages.language IN (${this.arrayPlaceholder(languages)})
			) AS ulangs
			ON users.id = ulangs.user`;
	}

	static sortField(sort: string): string {
		switch (sort) {
			case 'tag_cursor':
				return 'tag_cursor';
			case 'age_cursor':
				return 'age_cursor';
			case 'fame_cursor':
				return 'fame_cursor';
			case 'distance_cursor':
			default:
				return 'distance_cursor';
		}
	}

	/**
	 * Added placeholders: [cursor_id]
	 */
	static cursor_query({ scroll, sort, sort_dir }: SearchQuery) {
		if (scroll) {
			const dir = sort_dir === 'ASC' ? '>' : '<';
			let s = '';
			if (sort === 'distance_cursor') {
				s = `CONCAT(LPAD(ROUND(uinfo.distance), 5, '0'), LPAD(users.id, 5, '0'))`;
			} else if (sort === 'fame_cursor') {
				s = `CONCAT(LPAD(fame, 5, '0'), LPAD(users.id, 5, '0'))`;
			} else if (sort === 'age_cursor') {
				s = `CONCAT(LPAD(uinfo.age, 3, '0'), LPAD(users.id, 5, '0'))`;
			}
			return `AND ${s} ${dir} ?`;
		}
		return '';
	}

	static async search_without_tags(
		user_id: number,
		location: LocationXY,
		preferences_query: string,
		query: SearchQuery
	) {
		const { distance, age, fame, sort, sort_dir, languages, mode, scroll } = query;
		const placeholders = [
			...this.common_join_placeholders(user_id),
			location.y,
			location.x,
			...languages,
			user_id,
			distance,
			...age,
			...fame,
		];
		if (scroll) placeholders.push(query.cursor);
		return await User.query(
			`SELECT ${User.common_select_query()}
			FROM users
			${User.common_join_query(languages)}
			WHERE users.id != ?
				AND ${preferences_query} AND distance < ?
				AND age >= ? AND age <= ?
				${User.invalid_user_filter_query}
				AND fame >= ? AND fame <= ?
				${User.cursor_query(query)}
				AND block_list.blocked IS NULL
				AND (is_liked.liked IS NULL OR is_liking.user IS NULL)
				AND (reported_count < 3 OR reported_count IS NULL)
			ORDER BY ${this.sortField(sort)} ${sort_dir == 'ASC' ? 'ASC' : 'DESC'}
			LIMIT ${mode === 'image' ? 12 : 30}`,
			placeholders
		);
	}

	static async search_with_tags(
		user_id: number,
		location: LocationXY,
		preferences_query: string,
		query: SearchQuery
	) {
		const { distance, age, fame, sort, sort_dir, tags, languages, mode, scroll } = query;
		const placeholders = [
			...this.common_join_placeholders(user_id),
			location.y,
			location.x,
			...languages,
			...tags,
			user_id,
			distance,
			...age,
			...fame,
		];
		if (scroll) placeholders.push(query.cursor);
		return await User.query(
			`SELECT ${User.common_select_query()},
				utags.tag_list,
				LENGTH(utags.tag_list) - LENGTH(REPLACE(utags.tag_list, ',', '')) + 1 AS number_of_common_tags,
				CONCAT(LPAD(LENGTH(utags.tag_list) - LENGTH(REPLACE(utags.tag_list, ',', '')) + 1, 3, '0'), LPAD(users.id, 5, '0')) AS tag_cursor
			FROM users
			${User.common_join_query(languages)}
			LEFT JOIN (
				SELECT user, group_concat(IF(tags.name IN (${this.arrayPlaceholder(tags)}), tags.name, NULL)) as tag_list
				FROM user_tags
				LEFT JOIN tags
				ON user_tags.tag = tags.id
				GROUP BY user
			) AS utags
			ON users.id = utags.user
			WHERE users.id != ?
				AND ${preferences_query} AND distance < ?
				AND age >= ? AND age <= ?
				AND tag_list IS NOT NULL
				${User.invalid_user_filter_query}
				AND fame >= ? AND fame <= ?
				${User.cursor_query(query)}
				AND block_list.blocked IS NULL
				AND (is_liked.liked IS NULL OR is_liking.user IS NULL)
				AND (reported_count < 3 OR reported_count IS NULL)
			ORDER BY ${this.sortField(sort)} ${sort_dir == 'ASC' ? 'ASC' : 'DESC'}
			LIMIT ${mode === 'image' ? 12 : 30}`,
			placeholders
		);
	}
}

export default User;
