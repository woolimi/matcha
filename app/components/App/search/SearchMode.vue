<template>
	<v-container class="d-flex justify-space-between align-center">
		<v-btn-toggle v-if="mode === 'image'" mandatory dense>
			<v-btn value="distance_cursor" @click="sorting">
				<v-icon>mdi-map-marker-distance</v-icon>
				<v-icon v-show="sort === 'distance_cursor'">
					{{ this.sort_dir === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
				</v-icon>
			</v-btn>
			<v-btn value="fame_cursor" @click="sorting">
				<v-icon>mdi-crown</v-icon>
				<v-icon v-show="sort === 'fame_cursor'">
					{{ this.sort_dir === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
				</v-icon>
			</v-btn>
			<v-btn value="age_cursor" @click="sorting">
				<v-icon>mdi-account-tie</v-icon>
				<v-icon v-show="sort === 'age_cursor'">
					{{ this.sort_dir === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
				</v-icon>
			</v-btn>
			<v-btn value="tag_cursor" @click="sorting">
				<v-icon>mdi-tag</v-icon>
				<v-icon v-show="sort === 'tag_cursor'">
					{{ this.sort_dir === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
				</v-icon>
			</v-btn>
		</v-btn-toggle>
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
			sort() {
				return this.$store.state.search.sort;
			},
			sort_dir() {
				return this.$store.state.search.sort_dir;
			},
		},
		watch: {
			sort(newData, oldData) {
				if (newData === oldData) return;
				this.$store.dispatch('search/updateResult');
			},
			sort_dir(newData, oldData) {
				if (newData === oldData) return;
				this.$store.dispatch('search/updateResult');
			},
		},
		methods: {
			sorting(e) {
				this.$store.commit('search/SET_SEARCH_SORT', e.currentTarget.value);
			},
		},
	};
</script>

<style scoped></style>
