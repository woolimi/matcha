import { NextFunction } from 'express';
import _ from 'lodash';
import { RegisterForm, LoginForm } from '../init/Interfaces';

function validate_email(email: string): string {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (!re.test(String(email).toLowerCase())) return 'Invalid email format';
	return '';
}

function validate_username(username: string): string {
	if (username.length === 0) return 'username is required';
	else if (username.length < 4 || username.length > 20) return 'username must be between 4 to 20 letters.';
	return '';
}

function validate_firstName(firstName: string): string {
	if (firstName.length === 0) return 'first name is required';
	else if (firstName.length > 45) return 'Name must be less than 45 letters';
	return '';
}

function validate_lastName(lastName: string): string {
	if (lastName.length === 0) return 'last name is required';
	else if (lastName.length > 45) return 'Name must be less than 45 letters';
	return '';
}

function validate_password(password: string): string {
	if (password.length === 0) return 'password required';
	if (password.length < 4) return 'Password must be at least 4 characters long';
	if (password.length > 100) return 'Password must be at most 100 characters long';
	return '';
}

function validate_vpassword(password: string, vpassword: string): string {
	if (password !== vpassword) return 'Passwords does not match';
	return '';
}

function fieldsChecker(formData: RegisterForm | LoginForm, expectedFields: Array<string>): boolean {
	const foundFields = [];

	for (const field of Object.keys(formData)) {
		if (expectedFields.indexOf(field) < 0) {
			console.error(`Invalid field ${field}.`);
			return false;
		} else foundFields.push(field);
	}
	if (expectedFields.length != foundFields.length) {
		console.error(`Missing parameters.`);
		return false;
	}
	return true;
}

export default {
	userRegister(req: any, res: any, next: NextFunction): any {
		const user: RegisterForm = req.body;
		if (!fieldsChecker(user, ['email', 'username', 'firstName', 'lastName', 'password', 'vpassword']))
			return res.sendStatus(403);

		const error: any = {};
		let e_msg = '';
		e_msg = validate_email(user.email);
		if (e_msg) error.email = e_msg;
		e_msg = validate_username(user.username);
		if (e_msg) error.username = e_msg;
		e_msg = validate_firstName(user.firstName);
		if (e_msg) error.firstName = e_msg;
		e_msg = validate_lastName(user.lastName);
		if (e_msg) error.lastName = e_msg;
		e_msg = validate_password(user.password);
		if (e_msg) error.password = e_msg;
		e_msg = validate_vpassword(user.password, user.vpassword);
		if (e_msg) error.vpassword = e_msg;

		if (!_.isEmpty(error)) {
			return res.status(200).json({ error });
		}
		next();
	},
	userLogin(req: any, res: any, next: NextFunction): any {
		const user: LoginForm = req.body;
		console.log(user);
		if (!fieldsChecker(user, ['username', 'password'])) return res.sendStatus(403);
		next();
	},
};
