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
	selectChat(state, chat, messages) {
		state.chat = chat;
		state.messages.length = 0;
		state.messages.push(...messages);
	},
	receiveMessage(state, message) {
		state.messages.push(message);
	},
	unselectUser(state) {
		state.chat = undefined;
		state.messages.length = 0;
	},
};

export const actions = {
	load({ commit }) {
		this.$axios.get(`http://localhost:5000/api/users/chat/list`).then((response) => {
			commit('setList', response.data);
		});
	},
};

export const getters = {
	list: (state) => state.list,
};
