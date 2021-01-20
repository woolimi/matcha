<template>
	<v-app>
		<v-app-bar app color="primary" dark>
			<v-toolbar-title style="overflow: visible"> Matcha </v-toolbar-title>
			<v-tabs right>
				<v-tab to="/"> Home </v-tab>
				<template v-if="$auth.loggedIn">
					<v-tab to="/private"> {{ $auth.user.username }}'s page </v-tab>
					<v-tab @click="logout"> Logout </v-tab>
				</template>

				<template v-else>
					<v-tab to="/login"> Login </v-tab>
					<v-tab to="/register"> Register </v-tab>
				</template>
			</v-tabs>
		</v-app-bar>
		<v-main>
			<v-container>
				<nuxt />
			</v-container>
		</v-main>
		<v-footer color="primary lighten-1" padless>
			<v-row justify="center" no-gutters>
				<v-col class="primary lighten-2 py-4 text-center white--text">
					<NuxtLink to="/" style="text-decoration: none">
						<v-btn text rounded class="white--text"> <v-icon>mdi-home</v-icon> </v-btn>
					</NuxtLink>
				</v-col>
			</v-row>
		</v-footer>
		<Snackbar />
	</v-app>
</template>

<script>
	import SnackbarVue from '~/components/Snackbar.vue';
	import TokenManager from '~/plugins/TokenManager.client';

	export default {
		components: { SnackbarVue },
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

<style>
	html {
		overflow-y: auto;
	}
</style>
