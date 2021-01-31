<template>
	<v-card>
		<v-form @submit.prevent="userLogin">
			<v-card-title> Login </v-card-title>
			<v-card-text>
				<v-text-field
					label="Username"
					v-model="user.username"
					type="text"
					required
					prepend-inner-icon="mdi-account"
					:error-messages="error.username"
				/>
				<v-text-field
					label="Password"
					v-model="user.password"
					type="password"
					required
					prepend-inner-icon="mdi-lock"
					:error-messages="error.password"
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
	export default {
		auth: false,
		data() {
			return {
				user: {
					username: '',
					password: '',
				},
				error: {
					username: '',
					password: '',
				},
			};
		},
		methods: {
			async userLogin() {
				try {
					const validated = await this.$validator.userLogin(this.user);
					if (!_.isEmpty(validated.error)) throw { error: validated.error };

					const { data } = await this.$auth.loginWith('cookie', { data: this.user });
					if (data.error) {
						this.$notifier.showMessage({
							message: data.error,
							color: 'error',
						});
					}
				} catch (e) {
					if (e.error) {
						this.error = e.error;
					} else {
						console.error(e);
					}
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
