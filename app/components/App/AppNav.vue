<template>
	<div>
		<!-- app bar -->
		<v-app-bar app flat color="primary" clipped-left v-bind:style="{ 'z-index': 10 }">
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

		<!-- drawer -->
		<v-navigation-drawer v-model="drawer" app v-bind:permanent="$nuxt.$vuetify.breakpoint.lgAndUp">
			<v-toolbar></v-toolbar>
			<v-list nav dense>
				<v-list-item-group v-model="selected" active-class="primary--text text--accent-4">
					<v-list-item v-for="list in navList" :key="list.title">
						<template v-if="list.title === 'Logout'">
							<a @click="userLogout">
								<v-list-item-icon>
									<v-icon>{{ list.icon }}</v-icon>
								</v-list-item-icon>
								<v-list-item-title class="black--text">{{ list.title }}</v-list-item-title>
							</a>
						</template>
						<template v-else>
							<NuxtLink :to="{ path: list.path }">
								<v-list-item-icon>
									<v-icon>{{ list.icon }}</v-icon>
								</v-list-item-icon>
								<v-list-item-title class="black--text">{{ list.title }}</v-list-item-title>
							</NuxtLink>
						</template>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-navigation-drawer>
	</div>
</template>

<script>
	export default {
		mounted() {
			this.selected = this.navList.find((list) => list.path === this.$nuxt.$route.path).id;
		},
		props: ['app'],
		data: () => ({
			selected: null,
			drawer: false,
			navList: [
				{
					id: 0,
					title: 'Search',
					icon: 'mdi-magnify',
					path: '/app/search',
				},
				{
					id: 1,
					title: 'Profile',
					icon: 'mdi-account-circle',
					path: '/app/profile',
				},
				{
					id: 2,
					title: 'Chat',
					icon: 'mdi-forum',
					path: '/app/chat',
				},
				{
					id: 3,
					title: 'Notification',
					icon: 'mdi-bell',
					path: '/app/notification',
				},
				{
					id: 4,
					title: 'Logout',
					icon: 'mdi-logout',
				},
			],
		}),
		methods: {
			userLogout() {
				this.$tokenManager.logout();
			},
		},
	};
</script>
