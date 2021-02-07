import { NextFunction } from 'express';
import _ from 'lodash';
import { RegisterForm, LoginForm, PublicInfoForm, ChangePasswordForm } from '../init/Interfaces';
import LanguageSet from '../init/languages';
import User from '../models/User';

async function validate_email(email: string, option: any = false): Promise<string> {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (!re.test(String(email).toLowerCase())) return 'Invalid email format';

	if (option && option.prev_email === email) return '';

	const rows = await User.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
	if (rows.length !== 0) return 'email is already taken';
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

function validate_languages(languages: Array<string>) {
	if (!languages.length) return 'languages are required';
	for (const lang of languages) {
		if (!LanguageSet.has(lang)) return `Invalid language '${lang}'`;
	}
	return '';
}

function validate_gender(gender: string) {
	if (!gender) return 'gender is required';
	if (gender !== 'male' && gender !== 'female') return 'Invalid gender';
	return '';
}
function validate_preferences(preferences: string) {
	if (!preferences) return 'preference is required';
	if (preferences !== 'heterosexual' && preferences !== 'bisexual') return 'Invalid preference';
	return '';
}

function validate_tags(tags: Array<string>) {
	if (!tags.length) return 'interest tags are required';
	return '';
}

function validate_biography(biography: string) {
	if (!biography.length) return 'biography is required';
	if (biography.length > 150) return 'Too long';
	return '';
}

function fieldsChecker(formData: RegisterForm | LoginForm | PublicInfoForm, expectedFields: Array<string>): boolean {
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
	async userRegister(req: any, res: any, next: NextFunction): Promise<any> {
		try {
			const user: RegisterForm = req.body;
			if (
				!fieldsChecker(user, [
					'email',
					'username',
					'firstName',
					'lastName',
					'password',
					'vpassword',
					'location',
				])
			)
				return res.sendStatus(403);

			const error: any = {};
			let e_msg = '';
			e_msg = await validate_email(user.email);
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
				return res.json({ error });
			}
			next();
		} catch (error) {
			console.error(error);
			return res.sendStatus(500);
		}
	},
	userLogin(req: any, res: any, next: NextFunction): any {
		const user: LoginForm = req.body;
		if (!fieldsChecker(user, ['username', 'password'])) return res.sendStatus(400);
		next();
	},
	async userEmailVerification(req: any, res: any, next: NextFunction): Promise<any> {
		try {
			const data = req.body;
			if (!fieldsChecker(data, ['email', 'prev_email'])) return res.sendStatus(400);

			const error: any = {};
			let e_msg = '';
			e_msg = await validate_email(data.email, { prev_email: data.prev_email });
			if (e_msg) error.email = e_msg;
			if (!_.isEmpty(error)) return res.json({ error });
			next();
		} catch (error) {
			console.error(error);
			res.sendStatus(500);
		}
	},
	userLocation(req: any, res: any, next: NextFunction) {
		const location = req.body;
		if (_.isObject(location) && location.hasOwnProperty('lat') && location.hasOwnProperty('lng')) next();
		else return res.sendStatus(400);
	},
	userPictures(req: any, res: any, next: NextFunction) {
		const { user_id, image_id } = req.params;
		if (req.user.id !== Number(user_id)) return res.sendStatus(403);
		if (Number(image_id) < 0 || Number(image_id) > 4) return res.sendStatus(403);
		next();
	},
	userPublic(req: any, res: any, next: NextFunction) {
		const user: PublicInfoForm = req.body;
		if (!fieldsChecker(user, ['firstName', 'lastName', 'languages', 'gender', 'preferences', 'tags', 'biography']))
			return res.sendStatus(403);
		const error: any = {};
		let e_msg = '';
		e_msg = validate_firstName(user.firstName);
		if (e_msg) error.firstName = e_msg;
		e_msg = validate_lastName(user.lastName);
		if (e_msg) error.lastName = e_msg;
		e_msg = validate_languages(user.languages);
		if (e_msg) error.languages = e_msg;
		e_msg = validate_gender(user.gender);
		if (e_msg) error.gender = e_msg;
		e_msg = validate_preferences(user.preferences);
		if (e_msg) error.preferences = e_msg;
		e_msg = validate_tags(user.tags);
		if (e_msg) error.tags = e_msg;
		e_msg = validate_biography(user.biography);
		if (e_msg) error.biography = e_msg;

		if (!_.isEmpty(error)) return res.json({ error });
		next();
	},
	userChangePassword(req: any, res: any, next: NextFunction) {
		const pwForm: ChangePasswordForm = req.body;
		const error: any = {};
		let e_msg = '';
		e_msg = validate_password(pwForm.password);
		if (e_msg) error.password = e_msg;
		e_msg = validate_vpassword(pwForm.password, pwForm.vpassword);
		if (e_msg) error.vpassword = e_msg;

		if (!_.isEmpty(error)) return res.json({ error });
		next();
	},
};
