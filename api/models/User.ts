import MySQL from '../init/MySQL';
import Model from './Model';
import bcrypt from 'bcrypt';
import { ResultSetHeader } from 'mysql2';
import { RegisterForm } from '../init/Interfaces';

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
	preferences: ('male' | 'female' | 'all') | null;
	biography: string | null;
}

export interface UserPublicInterface {
	id: number;
	username: string;
	lastName: string;
	firstName: string;
	gender: ('male' | 'female') | null;
	preferences: ('male' | 'female' | 'all') | null;
	biography: string | null;
}

export interface UserSimpleInterface {
	id: number;
	username: string;
	picture: string | null;
}

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
			preferences ENUM('male','female','all') DEFAULT NULL,
			biography TEXT DEFAULT NULL,
			UNIQUE KEY email_UNIQUE (email),
			UNIQUE KEY username_UNIQUE (username)
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL.CHARSET} COLLATE=${MySQL.COLLATION}`;

	static init(): Promise<any> {
		return Model.init('users', User);
	}

	static async register(formData: RegisterForm): Promise<ResultSetHeader> {
		try {
			const data = { ...formData };
			data.password = await bcrypt.hash(formData.password, 10);
			return await User.query(
				'INSERT INTO `users` (`email`, `username`, `password`, `lastName`, `firstName`, `verified`) VALUES (?, ?, ?, ?, ?, false)',
				[data.email, data.username, data.password, data.firstName, data.lastName]
			);
		} catch (error) {
			throw error;
		}
	}

	static getAllSimple(ids: number[]): Promise<UserSimpleInterface[]> {
		return User.query(
			`SELECT u.id, u.username, p.extension as picture
			FROM ${User.tname} as u
			LEFT JOIN user_pictures as p ON p.user = u.id
			WHERE u.id IN (?)`,
			[ids.join(',')]
		);
	}
}

export default User;
