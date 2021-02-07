export const state = () => ({
	list: [],
	chat: undefined,
	messages: [],
});

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
	receiveMessage(state, message) {
		if (state.chat && state.chat.id == message.chat) {
			state.messages.push(message);
		}
	},
	messageError({ commit }, payload) {
		commit('snackbar/SHOW', { message: payload.error, color: 'error' }, { root: true });
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
};

export const getters = {
	list: (state) => state.list,
	chat: (state) => state.chat,
	messages: (state) => state.messages,
};
