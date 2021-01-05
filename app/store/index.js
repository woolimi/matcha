export const state = () => ({
	refreshId: null,
});

export const mutations = {
	SET_REFRESH_ID(state, id) {
		state.refreshId = id;
	},
};
export const actions = {
	async nuxtServerInit({ commit }, { app }) {
		// when page is refreshed
		const refresh_token = app.$cookies.get('auth._refresh_token.local');
		if (refresh_token) {
			console.log('REFRESH_TOKEN EXIST', refresh_token);
			try {
				const { data } = await app.$axios.post('/auth/refresh');
				// renew refresh_token
				app.$cookies.set('auth._refresh_token.local', data.refresh_token, {
					httpOnly: true,
					sameSite: true,
					expires: new Date(Date.now() + 3600 * 24 * 7),
					secure: false,
				});
				// renew access token
				app.$cookies.set('auth._token.local', `Bearer ${data.access_token}`);
				// app.$auth.strategy.token.set(data.access_token);
			} catch (error) {}
		}
	},
	setRefreshId({ commit }, id) {
		commit('SET_REFRESH_ID', id);
	},
};
