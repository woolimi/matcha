import { Context } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { AgeCalculator } from '@dipaktelangre/age-calculator';

interface RegisterForm {
	email: string;
	username: string;
	firstName: string;
	lastName: string;
	password: string;
	vpassword: string;
}

interface LoginForm {
	username: string;
	password: string;
}

interface EmailVerification {
	email: string;
	prev_email: string;
}

interface PublicInfoForm {
	username: string;
	firstName: string;
	lastName: string;
	languages: Array<string>;
	gender: string;
	preferences: string;
	tags: Array<string>;
	biography: string;
	birthdate: string;
}

interface ChangePasswordForm {
	password: string;
	vpassword: string;
}

async function validate_email(email: string, $axios: NuxtAxiosInstance, prev_email: string = '') {
	try {
		const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (!re.test(String(email).toLowerCase())) return 'Invalid email format';
		if (email !== prev_email) {
			const { data } = await $axios.post('/check/email', { email });
			if (data.error) return data.error;
		}
		return '';
	} catch (error) {
		console.error(error);
		return 'Server error';
	}
}

async function validate_username(
	username: string,
	$axios: NuxtAxiosInstance,
	prev_username: string = ''
): Promise<string> {
	try {
		if (username.length === 0) return 'username is required';
		else if (username.length < 4 || username.length > 30) return 'username must be between 4 to 30 letters.';
		if (username !== prev_username) {
			const { data } = await $axios.post('/check/username', { username });
			if (data.error) return data.error;
		}
		return '';
	} catch (error) {
		console.error(error);
		return 'Server error';
	}
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
	if (languages.length > 3) return 'languages are at most 3';
	return '';
}

function validate_gender(gender: string) {
	if (!gender) return 'gender is required';
	if (gender !== 'male' && gender !== 'female') return 'Invalid gender';
	return '';
}
function validate_preferences(preferences: string) {
	if (!preferences) return 'preference is required';
	if (preferences !== 'heterosexual' && preferences !== 'homosexual' && preferences !== 'bisexual') {
		return 'Invalid preference';
	}
	return '';
}

function validate_tags(tags: Array<string>) {
	if (!tags.length) return 'interest tags are required';
	if (tags.length > 5) return 'interest tags are at most 5';
	return '';
}

function validate_biography(biography: string) {
	if (!biography.length) return 'biography is required';
	if (biography.length > 150) return 'Too long';
	return '';
}

function validate_birthdate(birthdate: string) {
	if (!birthdate) return 'birthdate is required';
	if (AgeCalculator.getAgeIn(new Date(birthdate), 'years') < 18) return 'You must be at least 18 years old';
	return '';
}

export default ({ $axios, $auth }: Context, inject: Inject) => {
	inject('validator', {
		async userRegister(user: RegisterForm) {
			const error: any = {};
			let e_msg = '';
			e_msg = await validate_email(user.email, $axios);
			if (e_msg) error.email = e_msg;
			e_msg = await validate_username(user.username, $axios);
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
		userLogin(user: LoginForm) {
			const error: any = {};
			if (user.username.length === 0) error.username = 'username is required';
			if (user.password.length === 0) error.password = 'password is required';
			return { error };
		},
		async emailVerification(user: EmailVerification) {
			const error: any = {};
			let e_msg = '';
			e_msg = await validate_email(user.email, $axios);
			if (e_msg) error.email = e_msg;
			return { error };
		},
		async userPublic(user: PublicInfoForm, prev_username: string) {
			const error: any = {};

			let e_msg = '';
			e_msg = await validate_username(user.username, $axios, prev_username);
			if (e_msg) error.username = e_msg;
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
			e_msg = validate_birthdate(user.birthdate);
			if (e_msg) error.birthdate = e_msg;

			return { error };
		},
		userChangePassword(pwForm: ChangePasswordForm) {
			const error: any = {};
			let e_msg = '';
			e_msg = validate_password(pwForm.password);
			if (e_msg) error.password = e_msg;
			e_msg = validate_vpassword(pwForm.password, pwForm.vpassword);
			if (e_msg) error.vpassword = e_msg;
			return { error };
		},
	});
};
