export const state = () => ({
	list: [],
	loadedList: false,
	chat: undefined,
	messages: [],
	loadedChat: false,
	loadingMore: false,
	completed: false,
	lastEvent: 'none',
});

export const getters = {
	list: (state) => state.list,
	loadedList: (state) => state.loadedList,
	chat: (state) => state.chat,
	messages: (state) => state.messages,
	loadedChat: (state) => state.loadedChat,
	loadingMore: (state) => state.loadingMore,
	completed: (state) => state.completed,
	lastEvent: (state) => state.lastEvent,
};

export const mutations = {
	setList(state, list) {
		state.list.length = 0;
		state.list.push(...list);
		state.loadedList = true;
	},
	addToList(state, payload) {
		for (const chat of state.list) {
			if (chat.id == payload.id) return;
		}
		state.list.unshift(payload);
	},
	selectChat(state, id) {
		state.chat = state.list.find((chat) => chat.id == id);
		state.messages.length = 0;
		state.loadedChat = false;
		state.loadingMore = false;
		state.completed = false;
	},
	leaveChat(state) {
		state.chat = undefined;
		state.messages.length = 0;
		state.loadedChat = false;
		state.loadingMore = false;
		state.completed = false;
		state.lastEvent = 'none';
	},
	removeChat(state, id) {
		const index = state.list.findIndex((c) => c.id == id);
		if (index >= 0) state.list.splice(index, 1);
	},
	removeUserChat(state, id) {
		const index = state.list.findIndex((c) => c.user.id == id);
		if (index >= 0) state.list.splice(index, 1);
	},
	setMessages(state, payload) {
		state.lastEvent = 'initialLoad';
		state.messages.length = 0;
		state.messages.push(...payload.messages.reverse());
		state.loadedChat = true;
		state.completed = payload.completed;
	},
	insertMessages(state, payload) {
		state.lastEvent = 'loadedMore';
		state.messages.unshift(...payload.messages.reverse());
		state.completed = payload.completed;
	},
	receiveMessage(state, payload) {
		// Display the message if it's the current chat
		if (state.chat && state.chat.id == payload.chat) {
			state.lastEvent = 'newMessage';
			state.messages.push(payload);
		}
		// Update the last message in the list
		for (const chat of state.list) {
			if (chat.id == payload.chat) {
				chat.last = payload.at;
				break;
			}
		}
	},
	userLogin(state, payload) {
		for (const chat of state.list) {
			if (chat.user.id == payload.user) {
				chat.user.online = true;
				break;
			}
		}
	},
	userLogout(state, payload) {
		for (const chat of state.list) {
			if (chat.user.id == payload.user) {
				chat.user.online = false;
				break;
			}
		}
	},
	setLoadingMore(state, value) {
		state.loadingMore = value;
	},
};

export const actions = {
	loadList({ commit }) {
		return this.$axios.get(`/api/chat/list`).then((response) => {
			commit('setList', response.data);
		});
	},
	loadChat({ commit }, id) {
		commit('selectChat', id);
		this.$axios
			.get(`/api/chat/${id}`)
			.then((response) => {
				commit('setMessages', response.data);
				if (response.data.notification) {
					commit('notifications/setAsRead', response.data.notification, { root: true });
				}
			})
			.catch(() => {
				this.$router.push({ path: '/app/chat' });
			});
	},
	loadMore({ state, commit }) {
		if (state.completed) return;
		commit('setLoadingMore', true);
		const from = state.messages.length == 0 ? '' : state.messages[0].id;
		this.$axios.get(`/api/chat/${state.chat.id}/${from}`).then((response) => {
			commit('insertMessages', response.data);
			commit('setLoadingMore', false);
		});
	},
	unliked({ state, commit }, userId) {
		if (state.chat && state.chat.user.id == userId) {
			commit('leaveChat');
			this.$router.push({ path: '/app/chat' });
		}
		commit('removeUserChat', userId);
	},
	blocked({ state, commit }, payload) {
		const userId = payload.user;
		if (state.chat && state.chat.user.id == userId) {
			commit('leaveChat');
			this.$router.push({ path: '/app/chat' });
		}
		commit('removeUserChat', userId);
	},
	messageError({ commit }, payload) {
		commit('snackbar/SHOW', { message: payload.error, color: 'error' }, { root: true });
	},
};
