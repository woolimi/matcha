export const state = () => ({
	list: [],
	chat: undefined,
	messages: [],
});

export const getters = {
	list: (state) => state.list,
	chat: (state) => state.chat,
	messages: (state) => state.messages,
};

export const mutations = {
	setList(state, list) {
		state.list.length = 0;
		state.list.push(...list);
	},
	selectChat(state, chat) {
		state.chat = chat;
	},
	leaveChat(state) {
		state.chat = undefined;
		state.messages.length = 0;
	},
	setMessages(state, messages) {
		state.messages.length = 0;
		state.messages.push(...messages);
	},
	receiveMessage(state, payload) {
		// Display the message if it's the current chat
		if (state.chat && state.chat.id == payload.chat) {
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
};

export const actions = {
	loadList({ commit }) {
		this.$axios.get(`http://localhost:5000/api/users/chat/list`).then((response) => {
			commit('setList', response.data);
		});
	},
	loadChat({ commit }, chat) {
		commit('selectChat', chat);
		this.$axios.get(`http://localhost:5000/api/users/chat/${chat.id}`).then((response) => {
			commit('setMessages', response.data.messages);
		});
	},
	messageError({ commit }, payload) {
		commit('snackbar/SHOW', { message: payload.error, color: 'error' }, { root: true });
	},
};
