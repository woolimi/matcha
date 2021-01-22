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
								:error-messages="emailErrors"
								required
								@input="$v.user.email.$touch()"
								@blur="$v.user.email.$touch()"
								prepend-inner-icon="mdi-email"
							/>
							<v-text-field
								label="Username"
								type="text"
								v-model="user.username"
								:error-messages="usernameErrors"
								required
								@input="$v.user.username.$touch()"
								@blur="$v.user.username.$touch()"
								prepend-inner-icon="mdi-account"
							/>
							<v-text-field
								label="First name"
								type="text"
								v-model="user.firstName"
								:error-messages="firstNameErrors"
								required
								@input="$v.user.firstName.$touch()"
								@blur="$v.user.firstName.$touch()"
								prepend-inner-icon="mdi-card-account-details"
							/>
							<v-text-field
								label="Last name"
								type="text"
								v-model="user.lastName"
								:error-messages="lastNameErrors"
								required
								@input="$v.user.lastName.$touch()"
								@blur="$v.user.lastName.$touch()"
								prepend-inner-icon="mdi-card-account-details"
							/>
							<v-text-field
								label="Password"
								type="password"
								v-model="user.password"
								:error-messages="passwordErrors"
								required
								@input="$v.user.password.$touch()"
								@blur="$v.user.password.$touch()"
								prepend-inner-icon="mdi-lock"
							/>
							<v-text-field
								label="Verify password"
								type="password"
								v-model="user.vpassword"
								:error-messages="vpasswordErrors"
								required
								@input="$v.user.vpassword.$touch()"
								@blur="$v.user.vpassword.$touch()"
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
	import { validationMixin } from 'vuelidate';
	import { required, sameAs, minLength, maxLength, email } from 'vuelidate/lib/validators';

	export default {
		mixins: [validationMixin],
		auth: false,
		data() {
			return {
				user: {
					email: 'woolimi91@naver.com',
					username: 'username',
					firstName: 'firstName',
					lastName: 'lastName',
					password: 'password',
					vpassword: 'password',
				},
			};
		},
		validations: {
			user: {
				email: {
					required,
					email,
					// TODO: Debounce
					async isUnique(value) {
						// Avoid sending requests for invalid emails
						if (value === '' || !this.$v.user.email.email) return true;
						const res = await this.$axios.post(`/check/email`, { email: value });
						return res.status == 200 && res.data.unique;
					},
				},
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
						const res = await this.$axios.get(`/check/username`, { username: value });
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
			emailErrors() {
				const errors = [];
				if (!this.$v.user.email.$dirty) return errors;
				!this.$v.user.email.email && errors.push('Must be valid email');
				!this.$v.user.email.isUnique && errors.push('Email already taken');
				!this.$v.user.email.required && errors.push('Email is required');
				return errors;
			},
			usernameErrors() {
				const errors = [];
				if (!this.$v.user.username.$dirty) return errors;
				!this.$v.user.username.minLength && errors.push('Username must be at least 4 characters long');
				!this.$v.user.username.maxLength && errors.push('Username must be at most 20 characters long');
				!this.$v.user.username.isUnique && errors.push('Username already taken');
				!this.$v.user.username.required && errors.push('Name is required.');
				return errors;
			},
			firstNameErrors() {
				const errors = [];
				if (!this.$v.user.firstName.$dirty) return errors;
				!this.$v.user.firstName.maxLength && errors.push('Name must be at most 45 characters long');
				!this.$v.user.firstName.required && errors.push('Name is required.');
				return errors;
			},
			lastNameErrors() {
				const errors = [];
				if (!this.$v.user.lastName.$dirty) return errors;
				!this.$v.user.lastName.maxLength && errors.push('Name must be at most 45 characters long');
				!this.$v.user.lastName.required && errors.push('Name is required.');
				return errors;
			},
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
					this.$v.$touch();
					if (!this.$v.user.$invalid) {
						const res = await this.$axios.post('/auth/register', this.user);
						if (res.status === 201) {
							this.$store.dispatch('snackbar/show', {
								text: `Successfully registered, you can now login.\nPlease check your emails.`,
								color: 'success',
							});
							// TODO: Get token instead of refreshing the page
							// this.$router.push({ path: '/' });
							return window.location.replace('/');
						}
					} else {
						this.$store.dispatch('snackbar/show', {
							text: `Invalid form.`,
							color: 'error',
						});
					}
				} catch (error) {
					this.$store.dispatch('snackbar/show', {
						text: `Request error.`,
						color: 'error',
					});
					console.log(error);
				}
			},
		},
	};
</script>

<style scoped></style>
