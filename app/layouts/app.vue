<template>
	<v-app>
		<AppNav />
		<v-main>
			<nuxt />
		</v-main>
		<Footer />
	</v-app>
</template>

<script>
	import TokenManager from '~/plugins/TokenManager.client';

	export default {
		mounted() {
			if (this.$auth.loggedIn) {
				TokenManager.silentRefresh(this);
			}
		},
		methods: {
			async logout() {
				clearInterval(this.$store.state.refreshId);
				this.$store.dispatch('setRefreshId', null);
				await this.$auth.logout();
			},
		},
	};
</script>

<style scoped></style>
