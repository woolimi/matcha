<template>
	<v-app-bar app flat color="transparent">
		<v-toolbar-title class="white--text">
			<v-icon color="white">mdi-fire</v-icon>
			Matcha
		</v-toolbar-title>
		<v-spacer></v-spacer>
		<v-dialog v-model="loginModal" max-width="400px">
			<template v-slot:activator="{ on, attrs }">
				<v-btn v-bind="attrs" v-on="on" depressed small> login </v-btn>
			</template>
			<Login />
		</v-dialog>
	</v-app-bar>
</template>

<script>
	export default {
		computed: {
			loginModal: {
				get() {
					return this.$store.state.login.show;
				},
				set(val) {
					this.$store.commit('login/SET', val);
				},
			},
		},
	};
</script>

<style scoped></style>
