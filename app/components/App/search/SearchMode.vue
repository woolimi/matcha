<template>
	<v-container class="d-flex justify-space-between align-center">
		<span class="grey--text text--darken-2">Total 7 results</span>
		<v-btn-toggle mandatory v-model="mode" dense>
			<v-btn value="image">
				<v-icon> mdi-image-multiple-outline </v-icon>
			</v-btn>
			<v-btn value="map">
				<v-icon> mdi-map-search-outline </v-icon>
			</v-btn>
		</v-btn-toggle>
	</v-container>
</template>

<script>
	export default {
		computed: {
			mode: {
				get() {
					return this.$store.state.search.mode;
				},
				set(val) {
					this.$store.commit('search/SET_SEARCH_MODE', val);
				},
			},
		},
	};
</script>

<style scoped></style>
