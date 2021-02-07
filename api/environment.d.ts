declare global {
	namespace NodeJS {
		interface ProcessEnv {
			ACCESS_TOKEN_SECRET: Secret;
			REFRESH_TOKEN_SECRET: Secret;
			ENVIRONMENT: string;
			MAILGUN_API: string;
			REFRESH_TOKEN_EXP: string;
			REFRESH_COOKIE_NAME: string;
			ACCESS_TOKEN_EXP: string;
			MODE: string;
			API: string;
		}
	}
}

export {};
