export default {
	computed: {
		age: {
			get() {
				return this.$store.state.search.age;
			},
			set(val) {
				this.$store.commit('search/SET_AGE', val);
			},
		},
		distance: {
			get() {
				return this.$store.state.search.distance;
			},
			set(val) {
				this.$store.commit('search/SET_DISTANCE', val);
			},
		},
		fame: {
			get() {
				return this.$store.state.search.fame;
			},
			set(val) {
				this.$store.commit('search/SET_FAME', val);
			},
		},
	},
};
