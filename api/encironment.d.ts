declare global {
	namespace NodeJS {
		interface ProcessEnv {
			ACESS_TOKEN_SECRET: Secret;
			REFRESH_TOKEN_SECRET: Secret;
			ENVIRONMENT: string;
		}
	}
}
export {};
