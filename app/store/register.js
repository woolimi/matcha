export const state = () => ({
	modal: false,
});

export const mutations = {
	CLOSE(state) {
		state.modal = false;
	},
};
