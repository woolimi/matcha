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
	toggleLike({ state, commit }) {
		if (state.current.id) {
			this.$axios.post(`/api/like/${state.current.id}`).then((response) => {
				if (response.status == 200) {
					commit('setLike', response.data.like);
				} else {
					commit(
						'snackbar/SHOW',
						{
							message: 'Could not update Like status.',
							color: 'error',
						},
						{ root: true }
					);
				}
			});
		}
	},
	toggleBlock({ state, commit }) {
		if (state.current.id) {
			this.$axios.post(`/api/block/${state.current.id}`).then((response) => {
				if (response.status == 200) {
					commit('setBlock', response.data.blocked);
					commit(
						'snackbar/SHOW',
						{
							message: state.current.blocked ? 'User blocked' : 'User unblocked',
							color: 'success',
						},
						{ root: true }
					);
				} else {
					commit(
						'snackbar/SHOW',
						{
							message: 'Could not block User.',
							color: 'error',
						},
						{ root: true }
					);
				}
			});
		}
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
