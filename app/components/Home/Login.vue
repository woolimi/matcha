<template>
	<v-container fill-height fluid>
		<v-row>
			<v-col class="d-flex align-center justify-center pa-0">
				<v-card elevation="2" width="600px" class="pa-6">
					<v-form @submit.prevent="userLogin">
						<transition name="slide">
							<div v-if="forgot_pw" key="forgot">
								<v-card-title> Reset password </v-card-title>
								<v-card-text>
									<v-text-field
										label="Username"
										v-model="user.username"
										type="text"
										required
										prepend-inner-icon="mdi-account"
										:error-messages="error.username"
									/>
								</v-card-text>
								<div class="pa-1 d-flex justify-space-between">
									<a @click="forgot_pw = !forgot_pw">Back to login</a>
									<v-btn @click="resetPassword">Reset password</v-btn>
								</div>
							</div>
							<div v-else key="login">
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
								<v-row>
									<v-col cols="12" class="ma-0 pt-0 d-flex justify-center">
										<a @click="forgot_pw = !forgot_pw">Forgot password?</a>
									</v-col>
								</v-row>
								<v-card-actions>
									<v-row>
										<v-col cols="12">
											<div class="d-flex justify-space-between">
												<v-btn type="submit" class="primary"> Login </v-btn>
												<v-btn @click="googleLogin" class="warning">Login with Google</v-btn>
											</div>
										</v-col>
									</v-row>
								</v-card-actions>
							</div>
						</transition>
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
				forgot_pw: false,
			};
		},
		methods: {
			async userLogin() {
				try {
					const validated = await this.$validator.userLogin(this.user);
					if (!_.isEmpty(validated.error)) throw { error: validated.error };

					const { data } = await this.$auth.loginWith('cookie', { data: this.user });
					if (data.error) {
						return this.$notifier.showMessage({
							message: data.error,
							color: 'error',
						});
					}
					return this.$notifier.showMessage({
						message: 'Login sucess',
						color: 'success',
					});
				} catch (e) {
					let message = '';
					if (e.error) {
						// client validation error
						this.error = e.error;
						message = 'Invalid form';
					} else if (e.response && e.response.data) {
						// server validation error
						this.error = e.response.data.error;
						message = e.response.data.error;
					} else {
						this.error = {};
						message = e;
					}
					this.$notifier.showMessage({
						message,
						color: 'error',
					});
				}
			},
			googleLogin() {
				const state = randomstring.generate();
				const uri = this.$googleAuth.token.getUri({ state });
				localStorage.setItem('state', state);
				window.location = uri;
			},
			async resetPassword() {
				try {
					const { data } = await this.$axios.post('/auth/reset-password', {
						username: this.user.username,
					});
					this.$notifier.showMessage({
						message: data.message,
						color: 'success',
					});
					this.$store.commit('login/CLOSE');
				} catch (e) {
					let message = '';
					if (e.response && e.response.data) {
						// server validation error
						message = e.response.data.error;
					} else {
						message = e;
					}
					this.$notifier.showMessage({
						message,
						color: 'error',
					});
				}
			},
		},
	};
</script>

<style scoped>
	form {
		overflow: hidden;
	}
	.slide-enter-active {
		transition: all 0.2s ease;
	}
	.slide-leave-active {
		transition: all 0.2s ease;
	}
	.slide-enter {
		transform: translateX(-300px);
	}
	.slide-leave {
		display: none;
	}
	.slide-leave-to {
		display: none;
	}
</style>
