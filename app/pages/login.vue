<template>
	<v-container fill-height fluid>
		<v-row>
			<v-col class="d-flex align-center justify-center">
				<v-card elevation="2" width="600px" class="pa-6">
					<v-form @submit.prevent="userLogin">
						<v-card-title> Login </v-card-title>
						<v-card-text>
							<v-text-field
								label="E-mail"
								v-model="user.email"
								type="email"
								required
								prepend-inner-icon="mdi-email"
							/>
							<v-text-field
								label="Password"
								v-model="user.password"
								type="password"
								required
								prepend-inner-icon="mdi-lock"
							/>
						</v-card-text>
						<v-card-actions>
							<NuxtLink to="/register"> <v-btn class="secondary"> Register </v-btn> </NuxtLink>
							<v-spacer />
							<v-btn type="submit" class="primary"> Login </v-btn>
						</v-card-actions>
					</v-form>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
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
				user: {
					email: '',
					password: '',
				},
			};
		},
		methods: {
			async userLogin() {
				try {
					await this.$auth.loginWith('local', { data: this.user });
					TokenManager.silentRefresh(this);
					return this.$router.go(-1);
				} catch (error) {
					console.log(error);
				}
			},
		},
	};
</script>

<style scoped></style>
