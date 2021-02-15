<template>
	<v-container>
		<v-card elevation="4">
			<v-card-text>
				<v-subheader class="pa-0 h-init font-weight-bold">Tags</v-subheader>
				<v-autocomplete
					v-model="selected"
					chips
					multiple
					hide-selected
					auto-select-first
					@change="search = null"
					:items="items"
					:search-input.sync="search"
				>
				</v-autocomplete>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
	export default {
		computed: {
			selected: {
				get() {
					return this.$store.state.search.tags.selected;
				},
				set(val) {
					this.$store.commit('search/SET_TAGS_SELECTED', val);
				},
			},
			items() {
				return this.$store.state.search.tags.items;
			},
			search: {
				get() {
					return this.$store.state.search.tags.search;
				},
				set(val) {
					this.$store.commit('search/SET_TAGS_SEARCH', val);
				},
			},
		},
	};
</script>

<style scoped></style>
