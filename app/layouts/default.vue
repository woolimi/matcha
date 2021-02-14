<template>
	<v-app :style="!isLandingPage ? { height: '100vh' } : ''">
		<template v-if="isLandingPage">
			<HomeNav app />
			<div class="align-center justify-center d-flex flex-column landing">
				<h1 class="white--text">Find your Love</h1>
				<v-dialog v-model="show" max-width="400px">
					<template v-slot:activator="{ on, attrs }">
						<v-btn v-bind="attrs" v-on="on" color="primary">Create an Account</v-btn>
					</template>
					<Register />
				</v-dialog>
			</div>
		</template>
		<template v-else>
			<AppNav app />
		</template>
		<v-main :style="!isLandingPage ? { overflow: 'auto', 'flex-shrink': '1' } : { padding: '64px 0' }">
			<nuxt />
		</v-main>
		<Footer />
		<Snackbar />
	</v-app>
</template>

<script>
	export default {
		name: 'default',
		data() {
			return {
				isLandingPage: true,
			};
		},
		middleware: 'appRoute',
		mounted() {
			if (this.$auth.loggedIn) {
				this.$auth.refreshTokens();
			}
			this.isLandingPage = this.$route.path == '/';
		},
		watch: {
			$route(to, _from) {
				this.isLandingPage = to.path == '/';
			},
		},
		computed: {
			show: {
				get() {
					return this.$store.state.register.show;
				},
				set(val) {
					this.$store.commit('register/SET', val);
				},
			},
		},
	};
</script>

<style scoped>
	.landing {
		background-image: url(/img/home-bg.jpg);
		background-size: cover;
		background-position: center center;
		height: 100vh;
		background-attachment: fixed;
	}
	.landing h1 {
		font-size: 4em;
	}
</style>
