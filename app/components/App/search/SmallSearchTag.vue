<template>
	<v-expansion-panel>
		<v-expansion-panel-header>
			<v-row no-gutters>
				<v-col cols="12"> Tags </v-col>
				<v-col cols="6" class="text--secondary"> </v-col>
			</v-row>
		</v-expansion-panel-header>
		<v-expansion-panel-content>
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
		</v-expansion-panel-content>
	</v-expansion-panel>
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
