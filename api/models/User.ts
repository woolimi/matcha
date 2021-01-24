import Model from './Model';
import bcrypt from 'bcrypt';
import { ResultSetHeader } from 'mysql2';

interface RegisterForm {
	email: string;
	username: string;
	firstName: string;
	lastName: string;
	password: string;
	vpassword: string;
}

class User extends Model {
	static tname = 'users';
	static table =
		"CREATE TABLE `users` ( \
			`id` int NOT NULL AUTO_INCREMENT, \
			`email` varchar(60) NOT NULL, \
			`username` varchar(20) NOT NULL, \
			`password` varchar(100) NOT NULL, \
			`lastName` varchar(45) NOT NULL, \
			`firstName` varchar(45) NOT NULL, \
			`verified` tinyint DEFAULT '0', \
			PRIMARY KEY (`id`), \
			UNIQUE KEY `email_UNIQUE` (`email`), \
			UNIQUE KEY `username_UNIQUE` (`username`) \
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
	static init(): Promise<any> {
		return Model.init('users', User);
	}
	static async register(formData: RegisterForm): Promise<ResultSetHeader> {
		// TODO: Validation form
		try {
			const data = { ...formData };
			data.password = await bcrypt.hash(formData.password, 10);
			return await User.query(
				'INSERT INTO `users` (`email`, `username`, `password`, `lastName`, `firstName`) VALUES (?, ?, ?, ?, ?)',
				[data.email, data.username, data.password, data.firstName, data.lastName]
			);
		} catch (error) {
			throw error;
		}
	}
}

export default User;
