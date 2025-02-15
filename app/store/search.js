export const state = () => ({
	age: [18, 30],
	distance: 50,
	fame: [0, 30],
	tags: {
		selected: [],
		items: [],
	},
	mode: 'image' /* image or map mode*/,
	sort: 'distance_cursor' /* distance_cursor, age_cursor, fame_cursor, tag_cursor */,
	sort_dir: 'ASC' /* ASC, DESC */,
	cursor: '',
	no_more_data: false,
	users: [],
});

export const mutations = {
	SET_AGE: (state, payload) => {
		state.age = payload;
	},
	SET_DISTANCE: (state, payload) => {
		state.distance = payload;
	},
	SET_FAME: (state, payload) => {
		state.fame = payload;
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
	SET_USERS: (state, { users, scroll }) => {
		if (!scroll) state.no_more_data = false;
		if (scroll) state.users = [...state.users, ...users];
		else state.users = users;

		const last_user = users[users.length - 1];
		if (last_user) state.cursor = last_user[state.sort];
		state.no_more_data = users.length < 12 ? true : false;
	},
	INIT_TAGS: (state, payload) => {
		state.tags.items = payload.items;
		state.tags.selected = payload.selected;
	},
};

export const actions = {
	async updateResult({ commit, state, rootState }, scroll) {
		const { age, distance, fame, tags, sort, sort_dir, mode } = state;
		if (tags.selected.length === 0 && sort === 'tag_cursor') return;
		if (scroll && state.no_more_data) return;
		const params = {
			age,
			distance,
			fame,
			tags: tags.selected,
			sort,
			sort_dir,
			languages: rootState.auth.user.languages,
			scroll: !!scroll,
			cursor: state.cursor,
			mode,
		};
		const { data } = await this.$axios.post('/api/search', params);
		commit('SET_USERS', { users: data.users, scroll });
	},
	async initTags({ commit }, payload) {
		const { data } = await this.$axios.get('/api/tags');
		commit('INIT_TAGS', { items: data.tags, selected: payload });
	},
};
