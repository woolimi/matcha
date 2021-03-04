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
	unload(state) {
		state.list.length = 0;
	},
};

export const actions = {
	loadList({ commit }) {
		return this.$axios.get(`/api/block/list`).then((response) => {
			commit('setList', response.data);
		});
	},
	toggle({ commit }, id) {
		return this.$axios.post(`/api/block/${id}`).then((response) => {
			if (response.status == 200) {
				const status = response.data.status;
				if (status) {
					commit('add', response.data);
					commit('chat/removeUserChat', id, { root: true });
					commit('notifications/removeFromUser', id, { root: true });
				} else commit('remove', response.data.id);
				commit(
					'snackbar/SHOW',
					{
						message: status ? 'User blocked' : 'User unblocked',
						color: 'success',
					},
					{ root: true }
				);
				return status;
			} else {
				commit(
					'snackbar/SHOW',
					{
						message: 'Could not block User.',
						color: 'error',
					},
					{ root: true }
				);
				return false;
			}
		});
	},
};
