import { Context } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';

interface User {
	email: string;
	username: string;
	firstName: string;
	lastName: string;
	password: string;
	vpassword: string;
}

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

export default ({ store }: Context, inject: Inject) => {
	inject('validator', {
		userRegister(user: User) {
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
			return { error };
		},
	});
};
