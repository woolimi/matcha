export const state = () => ({
	show: false,
});

export const mutations = {
	CLOSE(state) {
		state.show = false;
	},
	SET(state, val) {
		state.show = val;
	},
};
