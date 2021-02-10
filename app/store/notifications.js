export const state = () => ({
	list: [],
});

export const mutations = {
	setList(state, list) {
		state.list.length = 0;
		state.list.push(...list);
	},
	receive(state, notification) {
		state.list.unshift(notification);
	},
};

export const actions = {
	loadList({ commit }) {
		this.$axios.get(`http://localhost:5000/api/users/notifications/list`).then((response) => {
			commit('setList', response.data);
		});
	},
};

export const getters = {
	list: (state) => state.list,
};
