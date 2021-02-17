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
};

export const actions = {
	loadList({ commit }) {
		this.$axios.get(`http://localhost:5000/api/notifications/list`).then((response) => {
			commit('setList', response.data);
		});
	},
	markAsRead({ commit }, id) {
		this.$axios.post(`http://localhost:5000/api/notifications/read`, { id }).then(() => {
			commit('setAsRead', id);
		});
	},
	markAllAsRead({ commit }) {
		this.$axios.post(`http://localhost:5000/api/notifications/read/all`).then(() => {
			commit('setAllAsRead');
		});
	},
};
