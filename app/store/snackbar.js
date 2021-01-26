export const state = () => ({
	show: false,
	message: '',
	color: '',
});

export const mutations = {
	SHOW(state, payload) {
		state.show = true;
		state.message = payload.message;
		state.color = payload.color;
	},
	CLOSE(state) {
		state.show = false;
	},
	SET(state, val) {
		state.show = val;
	},
};
