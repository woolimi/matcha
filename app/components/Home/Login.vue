<template>
	<v-container fill-height fluid>
		<v-row>
			<v-col class="d-flex align-center justify-center pa-0">
				<v-card elevation="2" width="600px" class="pa-6">
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
								<v-col cols="12" class="text-center">
									<v-btn type="submit" class="primary"> Login </v-btn>
								</v-col>
								<v-col cols="12">
									<v-divider></v-divider>
								</v-col>
								<v-col cols="12" class="text-center">
									<v-btn @click="googleLogin" class="warning">Login with Google</v-btn>
								</v-col>
							</v-row>
						</v-card-actions>
					</v-form>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
	import randomstring from 'randomstring';
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
					this.$notifier.showMessage({
						message: 'Login sucess',
						color: 'success',
					});
				} catch (e) {
					if (e.error) {
						this.error = e.error;
					} else {
						console.error(e);
						this.$notifier.showMessage({
							message: 'Server error',
							color: 'error',
						});
					}
				}
			},
			googleLogin() {
				const state = randomstring.generate();
				const uri = this.$googleAuth.token.getUri({ state });
				localStorage.setItem('state', state);
				window.location = uri;
			},
		},
	};
</script>

<style scoped>
	form {
		overflow: hidden;
	}
</style>
