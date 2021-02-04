export interface RegisterForm {
	email: string;
	username: string;
	firstName: string;
	lastName: string;
	password: string;
	vpassword: string;
	location: [number, number];
}

export interface LoginForm {
	username: string;
	password: string;
}
