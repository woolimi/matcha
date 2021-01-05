<template>
	<v-app dark>
		<v-app-bar flat app>
			<NuxtLink to="/" style="text-decoration: none">
				<v-toolbar-title> Matcha </v-toolbar-title>
			</NuxtLink>

			<v-spacer />

			<template v-if="$auth.loggedIn">
				<v-tabs right>
					<v-tab to="/private"> {{ $auth.user.username }}'s page </v-tab>
					<v-tab @click="logout"> Logout </v-tab>
				</v-tabs>
			</template>

			<template v-else>
				<v-tabs right>
					<v-tab to="/login"> Login </v-tab>
					<v-tab to="/register"> Register </v-tab>
				</v-tabs>
			</template>
		</v-app-bar>
		<v-main>
			<v-container>
				<nuxt />
			</v-container>
		</v-main>
		<v-footer app>
			<v-row>
				<v-col class="d-flex align-center justify-center">
					<NuxtLink to="/" style="text-decoration: none">
						<v-btn icon>
							<v-icon>mdi-home</v-icon>
						</v-btn>
					</NuxtLink>
				</v-col>
			</v-row>
		</v-footer>
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
