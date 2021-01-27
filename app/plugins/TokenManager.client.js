export default ({ app, store }, inject) => {
	inject('tokenManager', {
		silentRefresh() {
			const id = setInterval(async () => {
				const { data } = await app.$axios.post('/auth/refresh');
				app.$auth.strategy.token.set(data.access_token);
				console.log('REFRESH TOKEN');
			}, 1000 * 60 * 14); // every 14 mins
			store.commit('SET_REFRESH_ID', id);
		},
		async logout() {
			try {
				clearInterval(store.state.refreshId);
				store.commit('SET_REFRESH_ID', null);
				console.log('STOP REFRESH');
				await app.$axios.delete('/auth/logout');
				await app.$auth.logout();
			} catch (e) {
				console.error(e);
			}
		},
	});
};
