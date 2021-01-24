<template>
	<v-card elevation="2" width="600px" class="pa-6">
		<v-form @submit.prevent="userRegister">
			<v-card-title> Register </v-card-title>
			<v-card-text>
				<v-text-field
					label="E-mail"
					type="email"
					v-model="register.email"
					required
					prepend-inner-icon="mdi-email"
				/>
				<v-text-field
					label="Username"
					type="text"
					v-model="register.username"
					required
					prepend-inner-icon="mdi-account"
				/>
				<v-text-field
					label="First name"
					type="text"
					v-model="register.firstName"
					required
					prepend-inner-icon="mdi-card-account-details"
				/>
				<v-text-field
					label="Last name"
					type="text"
					v-model="register.lastName"
					required
					prepend-inner-icon="mdi-card-account-details"
				/>
				<v-text-field
					label="Password"
					type="password"
					v-model="register.password"
					required
					prepend-inner-icon="mdi-lock"
				/>
				<v-text-field
					label="Verify password"
					type="password"
					v-model="register.vpassword"
					required
					prepend-inner-icon="mdi-lock"
				/>
			</v-card-text>
			<v-card-actions>
				<v-row>
					<v-col class="text-center">
						<v-btn type="submit" class="primary"> submit </v-btn>
					</v-col>
				</v-row>
			</v-card-actions>
		</v-form>
	</v-card>
</template>

<script>
	import { required, sameAs, maxLength } from 'vuelidate/lib/validators';

	export default {
		auth: false,
		data() {
			return {
				register: {
					email: 'woolimi91@naver.com',
					username: 'username',
					firstName: 'firstName',
					lastName: 'lastName',
					password: 'password',
					vpassword: 'vpassword',
				},
			};
		},
		validations: {
			email: {
				required,
			},
			username: {
				required,
			},
			firstName: {
				required,
			},
			lastName: {
				required,
			},
			password: {
				required,
			},
			vpassword: {
				required,
				sameAsPassword: sameAs('password'),
			},
		},
		methods: {
			async userRegister() {
				// TODO: form validation (vuelidate)
				try {
					const res = await this.$axios.post('/auth/register', this.register);
					if (res.status === 201) {
						alert('Successfully registered. Please check your email.');
						return window.location.replace('/');
					}
				} catch (error) {
					console.log(error);
				}
			},
		},
	};
</script>

<style scoped></style>
