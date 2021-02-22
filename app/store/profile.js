export const state = () => ({
	current: {},
});

export const getters = {
	current: (state) => state.current,
};

export const mutations = {
	setCurrent(state, profile) {
		state.current = profile;
	},
	leaveCurrent(state) {
		state.current = {};
	},
	setLike(state, status) {
		state.current.like = status;
	},
	setBlock(state, status) {
		state.current.blocked = status;
		if (status) state.current.like = 0;
	},
	setReported(state, status) {
		state.current.reported = status;
		if (status) state.current.like = 0;
	},
	userLogin(state, id) {
		if (state.current.id === id) {
			state.current.online = true;
		}
	},
	userLogout(state, id) {
		if (state.current.id === id) {
			state.current.online = new Date().toISOString();
		}
	},
	addNotification(state, notification) {
		if (state.current.history) {
			state.current.history.unshift(notification);
		}
	},
};

export const actions = {
	load({ commit }, id) {
		commit('setCurrent', {});
		this.$axios
			.get(`/api/profile/${id}`)
			.then((response) => {
				commit('setCurrent', response.data);
			})
			.catch((error) => {
				commit('setCurrent', { id, error: error.response.data.error });
			});
	},
	blocked({ state, commit }, payload) {
		if (state.current && state.current.id == payload.user) {
			commit('setCurrent', { id: state.current.id, error: "You can't view this Profile right now." });
		}
	},
	unblocked({ state, dispatch }, payload) {
		if (state.current && state.current.id == payload.user) {
			dispatch('load', state.current.id);
		}
	},
	receiveNotification({ state, commit }, payload) {
		if (state.current && state.current.id == payload.user.id && !state.current.error) {
			if (payload.type == 'like:received') {
				commit('setLike', 3);
			} else if (payload.type == 'like:match') {
				commit('setLike', 2);
			} else if (payload.type == 'like:removed') {
				commit('setLike', state.current.like == 3 ? 0 : 1);
			}
			commit('addNotification', payload);
		}
	},
};
