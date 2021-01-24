<template>
	<v-card>
		<v-form @submit.prevent="userLogin">
			<v-card-title> Login </v-card-title>
			<v-card-text>
				<v-text-field
					label="E-mail"
					v-model="login.email"
					type="email"
					required
					prepend-inner-icon="mdi-email"
				/>
				<v-text-field
					label="Password"
					v-model="login.password"
					type="password"
					required
					prepend-inner-icon="mdi-lock"
				/>
			</v-card-text>
			<v-card-actions>
				<v-row>
					<v-col class="text-center">
						<v-btn type="submit" class="primary"> Login </v-btn>
					</v-col>
				</v-row>
			</v-card-actions>
		</v-form>
	</v-card>
</template>

<script>
	import TokenManager from '~/plugins/TokenManager.client';

	export default {
		auth: false,
		middleware({ store, redirect, app }) {
			if (app.$auth.loggedIn) return redirect('/private');
		},
		data() {
			return {
				login: {
					email: '',
					password: '',
				},
			};
		},
		methods: {
			async userLogin() {
				try {
					await this.$auth.loginWith('local', { data: this.login });
					TokenManager.silentRefresh(this);
					return this.$router.go(-1);
				} catch (error) {
					console.log(error);
				}
			},
		},
	};
</script>

<style scoped>
	form {
		overflow: hidden;
	}
</style>
