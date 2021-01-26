<template>
	<v-app>
		<template v-if="this.$route.path === '/'">
			<HomeNav />
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
				<h1 class="white--text" style="font-size: 4em">Find your love</h1>
				<v-dialog v-bind:value="this.$store.state.register.modal" max-width="400px">
					<template v-slot:activator="{ on, attrs }">
						<v-btn v-bind="attrs" v-on="on" color="primary">create your account</v-btn>
					</template>
					<Register />
				</v-dialog>
			</div>
		</template>
		<template v-else>
			<AppNav />
		</template>
		<v-main class="pt-0">
			<nuxt />
		</v-main>
		<Footer />
		<Snackbar />
	</v-app>
</template>

<script>
	export default {};
</script>
