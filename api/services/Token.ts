import jwt from 'jsonwebtoken';

function setRefreshToken(res: any, user: any) {
	const rtoken = generateToken(user, 'refresh');
	res.cookie(process.env.REFRESH_COOKIE_NAME, rtoken, {
		expires: new Date(Date.now() + 1000 * parseInt(process.env.REFRESH_TOKEN_EXP)),
		secure: process.env.ENVIRONMENT === 'prod',
		httpOnly: true,
		sameSite: process.env.ENVIRONMENT === 'prod' ? 'none' : 'lax',
		path: '/',
		domain: process.env.ENVIRONMENT === 'prod' ? 'matcha42-api.herokuapp.com' : 'localhost',
	});
	return rtoken;
}

function deleteRefreshToken(res: any) {
	return res.cookie(process.env.REFRESH_COOKIE_NAME, 'false', {
		expires: new Date(Date.now()),
		secure: process.env.ENVIRONMENT === 'prod',
		httpOnly: false,
		path: '/',
	});
}

function generateToken(obj: object, option: string = 'access') {
	if (option == 'access') {
		const access = jwt.sign(obj, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: `${process.env.ACCESS_TOKEN_EXP}s`, // 15 mins
		});
		console.log('⚡️[server]: access token generated');
		return access;
	}
	if (option == 'refresh') {
		const refresh = jwt.sign(obj, process.env.REFRESH_TOKEN_SECRET, {
			expiresIn: `${process.env.REFRESH_TOKEN_EXP}s`, // 1 week
		});
		console.log('⚡️[server]: refresh token generated');
		return refresh;
	}
}

export { setRefreshToken, deleteRefreshToken, generateToken };
