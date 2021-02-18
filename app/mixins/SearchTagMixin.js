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
