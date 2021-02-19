import { internet } from 'faker';

export interface RegisterForm {
	email: string;
	username: string;
	firstName: string;
	lastName: string;
	password: string;
	vpassword: string;
	location: LocationLL;
}

export interface LoginForm {
	username: string;
	password: string;
}

export interface PublicInfoForm {
	firstName: string;
	lastName: string;
	languages: Array<string>;
	gender: string;
	preferences: string;
	tags: Array<string>;
	biography: string;
	birthdate: string;
}

export interface ChangePasswordForm {
	password: string;
	vpassword: string;
}

export interface LocationLL {
	lat: number;
	lng: number;
}

export interface LocationXY {
	x: number;
	y: number;
}

export interface BeforeParsedSearchQuery {
	age: string[];
	distance: string;
	likes: string[];
	tags: string[];
	sort: string;
	sort_dir: string;
}

export interface SearchQuery {
	age: number[];
	distance: number;
	likes: number[];
	tags: string[];
	sort: string;
	sort_dir: string;
}
