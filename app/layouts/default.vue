<template>
	<v-app>
		<template v-if="this.$route.path === '/'">
			<HomeNav app />
			<div
				class="align-center justify-center d-flex flex-column"
				style="
					background-image: url(/img/home-bg.jpg);
					background-size: cover;
					background-position: center center;
					height: 100vh;
					background-attachment: fixed;
				"
			>
				<h1 class="white--text" style="font-size: 4em">Find your Love</h1>
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
		<v-main>
			<nuxt />
		</v-main>
		<Footer />
		<Snackbar />
	</v-app>
</template>

<script>
	export default {
		mounted() {
			if (this.$auth.loggedIn) {
				if (this.$store.state.refreshId) clearInterval(this.$store.state.refreshId);
				this.$tokenManager.silentRefresh(this);
			}
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
