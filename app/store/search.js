export const state = () => ({
	age: [18, 30],
	distance: 10,
	likes: 5,
	tags: {
		selected: [],
		search: '',
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
};

export const actions = {
	async updateUsers({ commit }, params) {
		try {
			const { data } = await this.$axios.get('/api/search', { params });
			commit('SET_USERS', data.users);
		} catch (error) {
			console.log(error);
		}
	},
};
