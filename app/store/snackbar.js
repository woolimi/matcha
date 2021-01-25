export const state = () => ({
	message: '',
	color: '',
});

export const mutations = {
	showMessage(state, payload) {
		state.message = payload.message;
		state.color = payload.color;
	},
};
