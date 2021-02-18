export const state = () => ({
	age: [18, 30],
	distance: 50,
	likes: 5,
	tags: {
		selected: [],
		items: [],
	},
	mode: 'image' /* image or map mode*/,
	users: [],
});

export const mutations = {
	SET_AGE: (state, payload) => {
		state.age = payload;
	},
	SET_DISTANCE: (state, payload) => {
		state.distance = payload;
	},
	SET_LIKES: (state, payload) => {
		state.likes = payload;
	},
	SET_TAGS_SELECTED: (state, payload) => {
		state.tags.selected = payload;
	},
	SET_TAGS_SEARCH: (state, payload) => {
		state.tags.search = payload;
	},
	SET_SEARCH_MODE: (state, payload) => {
		state.mode = payload;
	},
	SET_USERS: (state, payload) => {
		state.users = payload;
	},
	INIT_TAG_ITEMS: (state, payload) => {
		state.tags.items = payload;
	},
};

export const actions = {
	async updateResult({ commit, state }) {
		try {
			const { age, distance, likes, tags } = state;
			const params = { age, distance, likes, tags: tags.selected };
			const { data } = await this.$axios.get('/api/search', {
				params,
			});
			commit('SET_USERS', data.users);
		} catch (error) {
			console.error(error);
		}
	},
	async initTagItems({ commit }) {
		try {
			const { data } = await this.$axios.get('/api/tags');
			commit('INIT_TAG_ITEMS', data.tags);
		} catch (error) {
			console.error(error);
		}
	},
};
