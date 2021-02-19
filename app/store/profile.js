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
	toggleLike({ commit }) {
		if (this.profile.id) {
			this.$axios.post(`/api/like/${this.profile.id}`).then((response) => {
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
	toggleBlock({ commit }) {
		if (this.profile.id) {
			this.$axios.post(`/api/block/${this.profile.id}`).then((response) => {
				if (response.status == 200) {
					commit('setBlock', response.data.blocked);
					commit(
						'snackbar/SHOW',
						{
							message: this.profile.blocked ? 'User blocked' : 'User unblocked',
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
	liked({ state, commit }, payload) {},
	unliked({ state, commit }, payload) {},
	matched({ state, commit }, payload) {},
	historyUpdated({ state, commit }, payload) {},
	blocked({ state, commit }, payload) {},
};
