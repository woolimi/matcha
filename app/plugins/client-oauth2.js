import ClientOAuth2 from 'client-oauth2';

const googleAuth = new ClientOAuth2({
	clientId: process.env.GAPI_CLIENTID,
	authorizationUri: 'https://accounts.google.com/o/oauth2/v2/auth',
	redirectUri: `${process.env.APP}/callback`,
	scopes: ['email', 'profile'],
});

export default ({ store }, inject) => {
	inject('googleAuth', googleAuth);
};
