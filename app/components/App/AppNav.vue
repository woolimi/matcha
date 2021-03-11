<template>
	<div>
		<!-- drawer -->
		<v-navigation-drawer v-model="drawer" app v-bind:permanent="$nuxt.$vuetify.breakpoint.lgAndUp">
			<v-toolbar></v-toolbar>
			<v-list nav dense>
				<v-list-item-group v-model="selected" active-class="primary--text text--accent-4">
					<v-list-item v-for="(list, i) in navList" :key="i" :disabled="isDisabled(list.title)">
						<template v-if="list.title === 'Notifications'">
							<NuxtLink :to="{ path: list.path }">
								<v-list-item-icon>
									<v-icon>{{ list.icon }}</v-icon>
								</v-list-item-icon>
								<v-list-item-title :disabled="isDisabled(list.title)">
									{{ list.title }}
								</v-list-item-title>
								<v-list-item-action v-if="unreadNotifications.length > 0">
									<v-badge color="primary" inline :content="unreadNotifications.length"></v-badge>
								</v-list-item-action>
							</NuxtLink>
						</template>
						<template v-else>
							<NuxtLink :to="{ path: list.path }">
								<v-list-item-icon>
									<v-icon>{{ list.icon }}</v-icon>
								</v-list-item-icon>
								<v-list-item-title :disabled="isDisabled(list.title)">
									{{ list.title }}
								</v-list-item-title>
							</NuxtLink>
						</template>
					</v-list-item>
					<v-list-item>
						<a @click="userLogout">
							<v-list-item-icon>
								<v-icon>mdi-logout</v-icon>
							</v-list-item-icon>
							<v-list-item-title> Logout</v-list-item-title>
						</a>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-navigation-drawer>

		<!-- app bar -->
		<v-app-bar flat color="primary" clipped-left :style="{ 'z-index': 10 }">
			<v-row>
				<v-col cols="2">
					<v-app-bar-nav-icon
						class="white--text"
						@click="drawer = true"
						v-show="$nuxt.$vuetify.breakpoint.mdAndDown"
					></v-app-bar-nav-icon>
				</v-col>
				<v-col class="d-flex justify-space-around align-center">
					<div class="white--text text-h5">
						<v-icon color="white">mdi-fire</v-icon>
						Matcha
					</div>
				</v-col>
				<v-col cols="2" class="d-flex align-center">
					<v-spacer></v-spacer>
					<v-icon color="white" class="text-h5" @click="userLogout">mdi-logout</v-icon>
				</v-col>
			</v-row>
		</v-app-bar>
	</div>
</template>

<script>
	export default {
		props: ['app'],
		data: () => ({
			selected: null,
			drawer: false,
			navList: [
				{
					title: 'Search',
					icon: 'mdi-magnify',
					path: '/app/search',
				},
				{
					title: 'Profile',
					icon: 'mdi-account-circle',
					path: '/app/profile',
				},
				{
					title: 'Chat',
					icon: 'mdi-forum',
					path: '/app/chat',
				},
				{
					title: 'Notifications',
					icon: 'mdi-bell',
					path: '/app/notifications',
				},
				{
					title: 'Blocked',
					icon: 'mdi-cancel',
					path: '/app/blocked',
				},
			],
		}),
		created() {
			const path = this.navList.find((list) => list.path === this.$nuxt.$route.path);
			this.selected = path ? path.id : 0;
		},
		async fetch() {
			await this.$store.dispatch('notifications/loadList');
			await this.$store.dispatch('chat/loadList');
			this.$auth.refreshTokens();
			this.$store.dispatch('search/initTags', this.$auth.user.tags);
		},
		mounted() {
			this.$root.socket = this.$nuxtSocket({ teardown: true });
			this.$root.socket.on('socket/loggedOut', () => {
				this.$root.socket.emit('socket/login', { token: this.$auth.strategy.token.get() });
			});
			this.$root.socket.emit('socket/login', { token: this.$auth.strategy.token.get() }, (response) => {
				if (!response.success) {
					this.$notifier.showMessage({
						message: 'Could not link user to WebSocket, Refresh the page.',
						color: 'error',
					});
				} else {
					this.$root.socket.emit('user/changePage', { name: this.$route.name, params: this.$route.params });
				}
			});
		},
		methods: {
			userLogout() {
				this.$auth.logout();
				this.$root.socket.disconnect();
				this.$store.commit('chat/logout');
				this.$store.commit('notifications/unload');
				this.$store.commit('profile/leaveCurrent');
				this.$store.commit('blocked/unload');
			},
			isDisabled(title) {
				const { verified, languages, tags, preferences, gender, images } = this.$auth.user;
				if (title === 'Profile' || title === 'Logout') return false;
				if (!verified) return true;
				if (!languages.length || !tags.length || !preferences || !gender || !images[0].url) return true;
				return false;
			},
		},
		computed: {
			unreadNotifications() {
				return this.$store.getters['notifications/unread'];
			},
		},
		watch: {
			$route(to, _from) {
				this.$root.socket.emit('user/changePage', { name: to.name, params: to.params });
			},
		},
	};
</script>

<style scoped>
	.theme--light .v-list a {
		color: black;
	}
	.theme--dark .v-list a {
		color: white;
	}
	.theme--dark .v-list .v-list-item--active a {
		color: #ffcdd2;
	}
	.v-list-item--disabled {
		opacity: 0.6;
	}
</style>
