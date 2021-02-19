export const state = () => ({
	list: [],
});

export const getters = {
	list: (state) => state.list,
};

export const mutations = {
	setList(state, list) {
		state.list.length = 0;
		state.list.push(...list);
	},
	add(state, block) {
		state.list.unshift(block);
	},
	remove(state, id) {
		const index = state.list.findIndex((c) => c.id == id);
		if (index >= 0) state.list.splice(index, 1);
	},
};

export const actions = {
	loadList({ commit }) {
		return this.$axios.get(`/api/block/list`).then((response) => {
			commit('setList', response.data);
		});
	},
	unblock(context, payload) {
		this.$axios.post(`/api/block/${payload.user}`);
	},
};
