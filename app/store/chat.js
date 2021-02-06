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
		state.messages.push(message);
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
	rows: (state) => (user) => {
		const rows = [];
		for (const message of state.messages) {
			const type = message.sender == user ? 'sent' : 'received';
			const time = new Date(message.at);
			rows.push({
				id: message.id,
				type,
				time: `${`00${time.getHours()}`.slice(-2)}:${`00${time.getMinutes()}`.slice(-2)}`,
				content: message.content,
			});
		}
		return rows;
	},
};
