<template>
	<v-card elevation="4" height="450">
		<v-card-title
			>{{ this.$auth.user.username }}
			<span class="ml-1">
				<v-icon color="red">mdi-heart</v-icon>
				<span class="text-caption move-left">{{ 0 }}</span>
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
					<template v-if="user.verified">
						<v-btn rounded text small color="success">
							<v-icon color="success">mdi-check-circle </v-icon>
						</v-btn>
					</template>
					<template v-else-if="!user.verified || $auth.user.email != user.email">
						<v-btn rounded text small color="error">
							<v-icon color="error">mdi-alert-circle</v-icon>
						</v-btn>
					</template>
				</template>
			</v-text-field>
			<div class="text-right">
				<v-btn v-if="!user.verified || $auth.user.email != user.email" outlined small color="error"
					>send verification</v-btn
				>
				<v-btn v-else small text outlined color="success">verified</v-btn>
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
				<v-btn small text outlined color="warning">change password</v-btn>
			</div>

			<v-text-field label="Location" type="text" v-model="user.location" prepend-icon="mdi-map-marker" />
			<div class="text-right">
				<v-btn small text outlined color="info">change location</v-btn>
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
				},
				error: {},
			};
		},
	};
</script>

<style scoped>
	.move-left {
		position: relative;
		left: -5px;
		top: 3px;
	}
</style>
