export const state = () => ({
	modal: false,
});

export const mutations = {
	show(state) {},
};
export const actions = {
	show({ commit }, payload) {
		commit('show', payload);
	},
};
