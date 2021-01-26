<template>
	<v-container fill-height fluid>
		<v-row>
			<v-col class="d-flex align-center justify-center">
				<v-card elevation="2" width="600px" class="pa-6">
					<v-form @submit.prevent="userRegister">
						<v-card-title> Register </v-card-title>
						<v-card-text>
							<v-text-field
								label="E-mail"
								type="email"
								v-model="user.email"
								:error-messages="error.email"
								required
								prepend-inner-icon="mdi-email"
							/>
							<v-text-field
								label="Username"
								type="text"
								v-model="user.username"
								:error-messages="error.username"
								required
								prepend-inner-icon="mdi-account"
							/>
							<v-text-field
								label="First name"
								type="text"
								v-model="user.firstName"
								:error-messages="error.firstName"
								required
								prepend-inner-icon="mdi-card-account-details"
							/>
							<v-text-field
								label="Last name"
								type="text"
								v-model="user.lastName"
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
						<v-card-actions>
							<v-spacer />
							<v-btn type="submit" class="primary"> submit </v-btn>
						</v-card-actions>
					</v-form>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
	import { required, sameAs, minLength, maxLength, email } from 'vuelidate/lib/validators';
	import _ from 'lodash';

	export default {
		auth: false,
		data() {
			return {
				user: {
					email: 'woolimi91@naver.com',
					username: 'wpark',
					firstName: 'woolim',
					lastName: 'park',
					password: 'password',
					vpassword: 'password',
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
		validations: {
			user: {
				username: {
					required,
					minLength: minLength(4),
					maxLength: maxLength(20),
					// TODO: Debounce
					async isUnique(value) {
						// Avoid sending requests for invalid usernames
						if (value === '' || !this.$v.user.username.minLength || !this.$v.user.username.maxLength) {
							return true;
						}
						const res = await this.$axios.post(`/check/username`, { username: value });
						return res.status == 200 && res.data.unique;
					},
				},
				firstName: {
					required,
					maxLength: maxLength(45),
				},
				lastName: {
					required,
					maxLength: maxLength(45),
				},
				password: {
					required,
					minLength: minLength(4),
					maxLength: maxLength(100),
				},
				vpassword: {
					required,
					sameAsPassword: sameAs('password'),
				},
			},
		},
		computed: {
			passwordErrors() {
				const errors = [];
				if (!this.$v.user.password.$dirty) return errors;
				!this.$v.user.password.minLength && errors.push('Password must be at least 4 characters long');
				!this.$v.user.password.maxLength && errors.push('Password must be at most 100 characters long');
				!this.$v.user.password.required && errors.push('Password is required.');
				return errors;
			},
			vpasswordErrors() {
				const errors = [];
				if (!this.$v.user.vpassword.$dirty) return errors;
				!this.$v.user.vpassword.sameAsPassword && errors.push('Passwords does not match');
				return errors;
			},
		},
		methods: {
			async userRegister() {
				try {
					const validated = this.$validator.userRegister(this.user);
					if (!_.isEmpty(validated.error)) throw { error: validated.error };

					// 	const res = await this.$axios.post('/auth/register', this.user);
					// 	if (res.status === 201) {
					this.$notifier.showMessage({
						message: 'Successfully registered, you can now login. Please check your emails.',
						color: 'success',
					});
					this.$store.commit('register/CLOSE');
					return this.$router.push('/app/profile');
				} catch (e) {
					if (_.isEmpty(e.error)) {
						this.$notifier.showMessage({ message: 'Request error', color: 'error' });
					} else {
						this.error = e.error;
						this.$notifier.showMessage({
							message: 'Invalid form',
							color: 'error',
						});
					}
				}
			},
		},
	};
</script>

<style scoped></style>
