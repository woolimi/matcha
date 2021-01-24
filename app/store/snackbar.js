export const state = () => ({
	text: '',
	color: '',
	timeout: '',
});

export const mutations = {
	show(state, payload) {
		state.text = payload.text;
		state.color = payload.color;
		state.timeout = payload.timeout;
	},
};
export const actions = {
	show({ commit }, payload) {
		commit('show', payload);
	},
};
