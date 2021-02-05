export const state = () => ({
	loggedIn: false,
});

export const mutations = {
	LOGIN(state) {
		state.loggedIn = true;
	},
	LOGOUT(state) {
		state.loggedIn = false;
	},
};
