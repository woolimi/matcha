<template>
	<div></div>
</template>

<script>
	import randomstring from 'randomstring';

	export default {
		layout: 'empty',
		auth: false,
		async mounted() {
			if (this.$route.fullPath === '/callback') return this.$router.replace('/');
			if (this.$auth.loggedIn) return this.$router.replace('/app');

			let location = localStorage.getItem('location');
			try {
				location = JSON.parse(location);
			} catch (error) {
				location = null;
			}

			try {
				const prev_state = localStorage.getItem('state');
				const {
					data: { access_token, state },
				} = await this.$googleAuth.token.getToken(this.$route.fullPath);
				if (prev_state !== state) throw 'error';
				const {
					data: { email, email_verified, given_name, family_name, sub, picture },
				} = await this.$axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
				});
				const form = {
					email,
					verified: email_verified,
					firstName: given_name,
					lastName: family_name,
					provider: 'google',
					provider_id: sub,
					picture: picture.replace(/(s[0-9]+)-c/, 's300-c'),
					password: randomstring.generate(),
					username: `${given_name}.${family_name}-${randomstring.generate(4)}`,
					location,
				};
				const { data } = await this.$axios.post('/auth/social', form);
				this.$auth.setUserToken(data.access_token, data.refresh_token);
				this.$store.dispatch('search/initTags', this.$auth.user.tags);
				this.$notifier.showMessage({
					message: 'Login sucess',
					color: 'success',
				});
				return this.$router.replace('/');
			} catch (error) {
				this.$notifier.showMessage({
					message: 'Error',
					color: 'error',
				});
				return this.$router.replace('/');
			}
		},
	};
</script>
<style scoped></style>
