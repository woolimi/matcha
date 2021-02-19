export const state = () => ({
	age: [18, 30],
	distance: 50,
	likes: 5,
	tags: {
		selected: [],
		items: [],
	},
	mode: 'image' /* image or map mode*/,
	sort: 'distance' /* number_of_common_tags, distance, age, likes */,
	sort_dir: 'ASC' /* ASC, DESC */,
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
	SET_SEARCH_SORT: (state, payload) => {
		if (state.sort === payload) {
			state.sort_dir = state.sort_dir === 'ASC' ? 'DESC' : 'ASC';
		} else {
			state.sort = payload;
		}
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
			let { age, distance, likes, tags, sort, sort_dir } = state;
			if (tags.selected.length === 0 && sort === 'number_of_common_tags') return;
			const params = { age, distance, likes, tags: tags.selected, sort, sort_dir };
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
