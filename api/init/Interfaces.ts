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

export interface LocationLL {
	lat: number;
	lng: number;
}
export interface LocationXY {
	x: number;
	y: number;
}
