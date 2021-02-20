<template>
	<v-container>
		<v-card elevation="4">
			<v-card-text>
				<div class="pb-3 h-init font-weight-bold">Languages</div>
				<v-chip v-for="value in values" :key="value">{{ value }}</v-chip>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
	export default {
		computed: {
			values() {
				return this.$auth.user.languages;
			},
		},
	};
</script>

<style scoped></style>
