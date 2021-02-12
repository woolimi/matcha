<template>
	<div>
		<v-expansion-panels accordion class="d-md-none" style="position: fixed">
			<SmallSearchFilter />
			<SmallSearchTag />
		</v-expansion-panels>
		<div style="height: 6.5em" class="d-md-none"></div>
		<v-container class="d-flex justify-space-between align-center">
			<span class="grey--text text--darken-2">Total 7 results</span>
			<v-btn-toggle mandatory v-model="mode">
				<v-btn value="image">
					<v-icon> mdi-image-multiple-outline </v-icon>
				</v-btn>
				<v-btn value="map">
					<v-icon> mdi-map-search-outline </v-icon>
				</v-btn>
			</v-btn-toggle>
		</v-container>
		<Results />
	</div>
</template>

<script>
	export default {
		auth: true,
		data: () => ({
			mode: 'image',
			open: true,
		}),
	};
</script>

<style scoped>
	.h-init {
		height: initial;
	}
</style>
