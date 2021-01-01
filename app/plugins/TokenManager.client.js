export default {
  silentRefresh(app) {
    const id = setInterval(async () => {
      const { data } = await app.$axios.post('/auth/refresh');
      app.$auth.strategy.token.set(data.access_token);
    }, 1000 * 60 * 14); // every 14 mins
    app.$store.dispatch('setRefreshId', id);
  },
};
