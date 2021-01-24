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
		data() {
			return {
				loginModal: false,
			};
		},
	};
</script>

<style scoped></style>
