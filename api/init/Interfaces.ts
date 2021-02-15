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
