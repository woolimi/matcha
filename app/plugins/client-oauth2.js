import ClientOAuth2 from 'client-oauth2';

const googleAuth = new ClientOAuth2({
	clientId: '342917151081-omsbull5ubgg8sgtgj3i90v263irib1j.apps.googleusercontent.com',
	authorizationUri: 'https://accounts.google.com/o/oauth2/v2/auth',
	redirectUri: 'http://localhost:3000/callback',
	scopes: ['email', 'profile'],
});

export default ({ store }, inject) => {
	inject('googleAuth', googleAuth);
};
