declare global {
	namespace NodeJS {
		interface ProcessEnv {
			ACCESS_TOKEN_SECRET: Secret;
			REFRESH_TOKEN_SECRET: Secret;
			ENVIRONMENT: string;
			MAILGUN_API: string;
		}
	}
}
export {};
