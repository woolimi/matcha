export default ({ store }, inject) => {
	inject('notifier', {
		showMessage({ message = '', color = '' }) {
			store.commit('snackbar/showMessage', { message, color });
		},
	});
};
