import Model, { CHARSET, COLLATION } from './Model';
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
			// Check if all fields exist
			const fields = ['email', 'username', 'firstName', 'lastName', 'password', 'vpassword'];
			const foundFields = [];
			for (const field of Object.keys(formData)) {
				if (fields.indexOf(field) < 0) {
					throw new Error(`Invalid field ${field}.`);
				} else foundFields.push(field);
			}
			if (fields.length != foundFields.length) {
				throw new Error(`Missing parameters.`);
			}
			// Check if all fields are valid
			fields.forEach((field) => {
				if (formData[field as keyof RegisterForm]!.length < 0) {
					throw new Error(`Empty field ${field} !`);
				}
			});
			// Check valid email -- @see https://regexr.com/2rhq7
			if (
				!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
					formData.email!
				)
			) {
				throw new Error('Invalid email !');
			}
			// Check duplicate email or usernames
			const check = await User.query('SELECT id FROM users WHERE email = ? OR username = ?', [
				formData.email,
				formData.username,
			]);
			// [ { id: number }, ... ]
			if (check && check.length > 0) {
				throw new Error(`Email or username already taken.`);
			}
			// Check passwords
			if (formData.password != formData.vpassword) {
				throw new Error('The password validation does not match the password.');
			}
			// Save
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
