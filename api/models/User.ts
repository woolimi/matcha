import Model, { CHARSET, COLLATION } from './Model';
import bcrypt from 'bcrypt';
import { ResultSetHeader } from 'mysql2';
import { RegisterForm } from '../init/Interfaces';

class User extends Model {
	static tname = 'users';
	static table = `CREATE TABLE users (
			id int NOT NULL AUTO_INCREMENT,
			email varchar(60) NOT NULL,
			username varchar(20) NOT NULL,
			password varchar(100) NOT NULL,
			lastName varchar(45) NOT NULL,
			firstName varchar(45) NOT NULL,
			verified tinyint DEFAULT '0',
			initialized tinyint DEFAULT '0',
			gender enum('male','female') DEFAULT NULL,
			preferences enum('male','female','all') DEFAULT NULL,
			biography TEXT DEFAULT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY email_UNIQUE (email),
			UNIQUE KEY username_UNIQUE (username)
		) ENGINE=InnoDB DEFAULT CHARSET=${CHARSET} COLLATE=${COLLATION}`;
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
}

export default User;
