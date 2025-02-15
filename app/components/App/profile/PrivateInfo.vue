<template>
	<v-card elevation="4" height="450">
		<v-card-title
			>{{ this.$auth.user.username }}
			<span class="ml-1">
				<v-icon color="amber">mdi-crown</v-icon>
				<span class="text-caption move-left">{{ this.$auth.user.fame }}</span>
			</span>
		</v-card-title>
		<v-card-text>
			<v-text-field
				label="email"
				v-model="user.email"
				type="email"
				prepend-icon="mdi-account"
				:error-messages="error.email"
			>
				<template v-slot:append>
					<template v-if="!user.verified || $auth.user.email !== user.email">
						<v-btn rounded text small color="error">
							<v-icon color="error">mdi-alert-circle</v-icon>
						</v-btn>
					</template>
					<template v-else>
						<v-btn rounded text small color="success">
							<v-icon color="success">mdi-check-circle </v-icon>
						</v-btn>
					</template>
				</template>
			</v-text-field>
			<div class="text-right">
				<v-btn v-if="sentEmail" outlined small text :ripple="false" color="info" class="no-cursor">
					Sent
				</v-btn>
				<v-btn
					:loading="loading.email"
					v-else-if="!user.verified || $auth.user.email !== user.email"
					text
					small
					color="error"
					@click="emailVerification"
				>
					Send verification
				</v-btn>
				<v-btn
					v-if="user.verified && $auth.user.email === user.email"
					small
					text
					outlined
					:ripple="false"
					class="no-cursor"
					color="success"
				>
					Verified
				</v-btn>
			</div>

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
			<div class="text-right">
				<v-btn small color="warning" @click="changePassword">Change Password</v-btn>
			</div>

			<div class="text-right">
				<v-dialog v-model="map" width="80vw" height="60vh">
					<template v-slot:activator="{ on, attrs }">
						<v-text-field
							v-bind="attrs"
							v-on="on"
							readonly
							label="Location"
							type="text"
							v-model="location"
							prepend-icon="mdi-map-marker"
						/>
					</template>
					<v-card>
						<GoogleMap />
					</v-card>
				</v-dialog>
			</div>
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
		data() {
			return {
				user: {
					email: this.$auth.user.email,
					verified: this.$auth.user.verified,
					password: '',
					vpassword: '',
				},
				loading: {
					email: false,
				},
				sentEmail: false,
				error: {
					email: '',
					password: '',
					vpassword: '',
				},
				map: false,
			};
		},
		computed: {
			location: {
				get() {
					if (this.$auth.loggedIn) return JSON.stringify(Object.values(this.$auth.user.location));
					return '[]';
				},
				set(val) {},
			},
		},
		methods: {
			async changePassword() {
				try {
					const change_password_form = {
						password: this.user.password,
						vpassword: this.user.vpassword,
					};
					const validated = await this.$validator.userChangePassword(change_password_form);
					if (!_.isEmpty(validated.error)) throw { error: validated.error };
					const { data } = await this.$axios.post('/api/profile/change-password', change_password_form);
					if (!_.isEmpty(data.error)) throw { error: data.error };
					this.$notifier.showMessage({
						message: 'password changed',
						color: 'success',
					});
					this.user.password = '';
					this.user.vpassword = '';
				} catch (e) {
					if (_.isEmpty(e.error)) {
						this.$notifier.showMessage({ message: 'Error', color: 'error' });
					} else {
						this.error = e.error;
					}
				}
			},
			async emailVerification() {
				try {
					this.loading.email = true;
					const email_verification_form = {
						email: this.user.email,
						prev_email: this.$auth.user.email,
					};
					const validated = await this.$validator.emailVerification(email_verification_form);
					if (!_.isEmpty(validated.error)) throw { error: validated.error };

					const { data } = await this.$axios.post(
						'/api/profile/send-email-verification',
						email_verification_form
					);
					if (!_.isEmpty(data.error)) throw { error: data.error };

					this.$notifier.showMessage({
						message: data.message,
						color: 'success',
					});
					this.$auth.setUser({ ...this.$auth.user, email: this.user.email });
					this.loading.email = false;
					this.sentEmail = true;
				} catch (e) {
					if (_.isEmpty(e.error)) {
						console.error(e);
						this.$notifier.showMessage({ message: 'Error', color: 'error' });
					} else {
						this.error = e.error;
						this.$notifier.showMessage({
							message: 'Invalid email',
							color: 'error',
						});
					}
					this.loading.email = false;
				}
			},
		},
	};
</script>

<style scoped>
	.move-left {
		position: relative;
		left: -5px;
		top: 3px;
	}
	.no-cursor {
		cursor: not-allowed;
	}
</style>
