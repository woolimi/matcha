export const state = () => ({
	list: [],
});

export const getters = {
	list: (state) => state.list,
	unread: (state) => state.list.filter((n) => !n.status),
};

export const mutations = {
	setList(state, list) {
		state.list.length = 0;
		state.list.push(...list);
	},
	receive(state, notification) {
		state.list.unshift(notification);
	},
	setAsRead(state, id) {
		for (const notification of state.list) {
			if (notification.id == id) {
				notification.status = true;
				break;
			}
		}
	},
	setAllAsRead(state) {
		for (const notification of state.list) {
			notification.status = true;
		}
	},
	setListAsRead(state, list) {
		for (const id of list) {
			for (const notification of state.list) {
				if (notification.id == id) {
					notification.status = true;
					break;
				}
			}
		}
	},
};

export const actions = {
	loadList({ commit }) {
		return this.$axios.get(`/api/notifications/list`).then((response) => {
			commit('setList', response.data);
		});
	},
	markAsRead({ commit }, id) {
		this.$axios.post(`/api/notifications/read`, { id }).then(() => {
			commit('setAsRead', id);
		});
	},
	markAllAsRead({ commit }) {
		this.$axios.post(`/api/notifications/read/all`).then(() => {
			commit('setAllAsRead');
		});
	},
	setListAsRead({ commit }, payload) {
		commit('setListAsRead', payload.list);
	},
	receive({ dispatch, commit }, payload) {
		commit('receive', payload);
		if (payload.type == 'like:removed') {
			dispatch('chat/unliked', payload.user.id, { root: true });
		}
	},
};
