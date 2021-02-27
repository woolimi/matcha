export default {
	computed: {
		selected: {
			get() {
				return this.$store.state.search.tags.selected;
			},
			set(val) {
				if (val.length > 10) {
					this.$store.commit('snackbar/SHOW', {
						message: 'Maximun 10 tags allowed',
						color: 'error',
					});
					val.pop();
				}
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
