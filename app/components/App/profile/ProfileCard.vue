<template>
	<v-container>
		<v-row>
			<v-col cols="12" sm="6">
				<v-card elevation="4" height="400">
					<v-container>
						<v-img height="250" src="https://cdn.vuetifyjs.com/images/cards/cooking.png"></v-img>
					</v-container>
					<v-container>
						<v-row>
							<v-col cols="6">box1</v-col>
							<v-col cols="6">box2</v-col>
						</v-row>
						<v-row>
							<v-col cols="6">box3</v-col>
							<v-col cols="6">box4</v-col>
						</v-row>
					</v-container>
				</v-card>
			</v-col>
			<v-col cols="12" sm="6">
				<v-card elevation="4" height="400">
					<v-card-title>{{ this.$auth.username }} Info</v-card-title>
					<v-card-text>
						<v-row align="center" class="mx-0">
							<v-rating :value="4.5" color="amber" dense half-increments readonly size="14"></v-rating>
							<div class="grey--text ml-4">4.5 (413)</div>
							<div class="grey--text ml-4">location: paris</div>
						</v-row>
						<v-text-field
							label="email"
							v-model="user.email"
							type="email"
							prepend-icon="mdi-account"
							:error-messages="error.email"
						/>
						<v-text-field
							label="Password"
							type="password"
							v-model="user.password"
							:error-messages="error.password"
							prepend-icon="mdi-lock"
						/>
						<v-text-field
							label="Verify password"
							type="password"
							v-model="user.vpassword"
							:error-messages="error.vpassword"
							prepend-icon="mdi-lock"
						/>
						<v-text-field
							label="Location"
							type="text"
							v-model="user.location"
							prepend-icon="mdi-map-marker"
						/>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
	export default {
		data() {
			return {
				user: {
					email: '',
					password: '',
				},
				error: {},
			};
		},
	};
</script>

<style scoped></style>
