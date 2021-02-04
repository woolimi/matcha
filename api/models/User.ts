import MySQL from '../init/MySQL';
import Model from './Model';
import bcrypt from 'bcrypt';
import { ResultSetHeader } from 'mysql2';
import { RegisterForm } from '../init/Interfaces';

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
			location POINT NOT NULL SRID 4326,
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
				'INSERT INTO `users` (`email`, `username`, `password`, `lastName`, `firstName`, `verified`, `location`) VALUES (?, ?, ?, ?, ?, false, ST_SRID(POINT(?, ?), 4326))',
				[
					data.email,
					data.username,
					data.password,
					data.firstName,
					data.lastName,
					data.location[1],
					data.location[0],
				]
			);
		} catch (error) {
			throw error;
		}
	}
}

export default User;
