<template>
	<v-container fill-height fluid>
		<v-row>
			<v-col class="d-flex align-center justify-center pa-0">
				<v-card elevation="2" width="600px" class="pa-6">
					<v-form @submit.prevent="userRegister">
						<v-card-title> Register </v-card-title>
						<v-card-text>
							<v-text-field
								label="E-mail"
								type="email"
								v-model.trim="user.email"
								:error-messages="error.email"
								required
								prepend-inner-icon="mdi-email"
							/>
							<v-text-field
								label="Username"
								type="text"
								v-model.trim="user.username"
								:error-messages="error.username"
								required
								prepend-inner-icon="mdi-account"
							/>
							<v-text-field
								label="First name"
								type="text"
								v-model.trim="user.firstName"
								:error-messages="error.firstName"
								required
								prepend-inner-icon="mdi-card-account-details"
							/>
							<v-text-field
								label="Last name"
								type="text"
								v-model.trim="user.lastName"
								:error-messages="error.lastName"
								required
								prepend-inner-icon="mdi-card-account-details"
							/>
							<v-text-field
								label="Password"
								type="password"
								v-model="user.password"
								:error-messages="error.password"
								required
								prepend-inner-icon="mdi-lock"
							/>
							<v-text-field
								label="Verify password"
								type="password"
								v-model="user.vpassword"
								:error-messages="error.vpassword"
								required
								prepend-inner-icon="mdi-lock"
							/>
						</v-card-text>
						<v-card-actions class="d-flex justify-space-between">
							<v-btn type="submit" class="primary"> submit </v-btn>
							<div>OR</div>
							<v-btn @click="googleLogin" class="warning">Sign up with Google</v-btn>
						</v-card-actions>
					</v-form>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
	import _ from 'lodash';
	import randomstring from 'randomstring';

	export default {
		auth: false,
		data() {
			return {
				user: {
					email: '',
					username: '',
					firstName: '',
					lastName: '',
					password: '',
					vpassword: '',
				},
				error: {
					email: '',
					username: '',
					firstName: '',
					lastName: '',
					password: '',
					vpassword: '',
				},
			};
		},
		methods: {
			async userRegister() {
				try {
					const validated = await this.$validator.userRegister(this.user);
					if (!_.isEmpty(validated.error)) throw { error: validated.error };

					const { data, status } = await this.$axios.post('/auth/register', {
						...this.user,
						location: JSON.parse(localStorage.getItem('location')),
					});
					if (data.error) throw { error: data.error };
					if (status === 201) {
						this.$notifier.showMessage({
							message: 'Successfully registered, you can now login. Please check your emails.',
							color: 'success',
						});
					}
					this.$store.commit('register/CLOSE');
				} catch (e) {
					if (_.isEmpty(e.error)) {
						console.error(e);
						this.$notifier.showMessage({ message: 'Error', color: 'error' });
					} else {
						this.error = e.error;
						this.$notifier.showMessage({
							message: 'Invalid form',
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
