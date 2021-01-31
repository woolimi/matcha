<template>
	<v-card elevation="4" height="400">
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
			/>
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
			<v-text-field label="Location" type="text" v-model="user.location" prepend-icon="mdi-map-marker" />
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
		data() {
			return {
				user: {},
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
