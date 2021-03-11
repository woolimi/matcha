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
	removeFromUser(state, id) {
		state.list = state.list.filter((n) => n.user.id != id);
	},
	unload(state) {
		state.list.length = 0;
	},
};

export const actions = {
	loadList({ commit }) {
		return this.$axios.get(`/api/notifications/list`).then((response) => {
			commit('setList', response.data);
		});
	},
	markAsRead({ commit }, id) {
		return this.$axios.post(`/api/notifications/read`, { id }).then(() => {
			commit('setAsRead', id);
		});
	},
	markAllAsRead({ commit }) {
		return this.$axios.post(`/api/notifications/read/all`).then(() => {
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
		dispatch('profile/receiveNotification', payload, { root: true });
	},
	blockedBy({ commit, dispatch }, payload) {
		commit('removeFromUser', payload.user);
		dispatch('chat/blocked', payload, { root: true });
		dispatch('profile/blocked', payload, { root: true });
	},
	unblockedBy({ dispatch }, payload) {
		dispatch('profile/unblocked', payload, { root: true });
	},
	userLogin({ commit }, payload) {
		commit('chat/userLogin', payload.user, { root: true });
		commit('profile/userLogin', payload.user, { root: true });
	},
	userLogout({ commit }, payload) {
		commit('chat/userLogout', payload.user, { root: true });
		commit('profile/userLogout', payload.user, { root: true });
	},
};
