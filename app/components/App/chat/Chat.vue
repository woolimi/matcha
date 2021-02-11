<template>
	<v-col cols="12" md="9" class="chat" :class="classes">
		<template v-if="chat">
			<v-toolbar class="flex-grow-0" style="z-index: 1">
				<v-icon class="hidden-md-and-up" @click="leaveChat">mdi-chevron-left</v-icon>

				<v-badge
					:color="chat.user.online ? 'green' : 'pink'"
					bordered
					avatar
					dot
					bottom
					offset-x="10"
					offset-y="10"
					class="mx-2"
				>
					<v-avatar size="50">
						<v-img :src="chat.user.picture"></v-img>
					</v-avatar>
				</v-badge>
				<v-toolbar-title>{{ chat.user.username }}</v-toolbar-title>

				<v-spacer></v-spacer>

				<v-btn text color="pink" @click="unlike"> <v-icon>mdi-heart</v-icon> Unlike </v-btn>
				<v-btn text color="danger" @click="block"> <v-icon>mdi-cancel</v-icon> Block </v-btn>
			</v-toolbar>
			<v-container
				fluid
				ref="messages"
				class="messages grey d-flex flex-grow-1 flex-shrink-1 flex-column flex-fill lighten-5 mb-0"
			>
				<template v-for="row in rows">
					<template v-if="row.header">
						<v-subheader :key="row.header">{{ row.header }}</v-subheader>
						<v-divider :key="`div_${row.header}`"></v-divider>
					</template>
					<Message v-else :type="row.type" :time="row.time" :content="row.content" :key="row.id" />
				</template>
			</v-container>
			<v-container
				fluid
				class="d-flex justify-center flex-grow-0 align-center flex-nowrap elevation-4 message-input"
			>
				<v-form @submit.prevent="sendMessage" style="width: 100%">
					<v-text-field
						v-model="message"
						append-outer-icon="mdi-send"
						filled
						label="Message"
						type="text"
						dense
						hide-details
						class="mb-0"
						:disabled="disabled"
					></v-text-field
				></v-form>
			</v-container>
		</template>
		<template v-else>
			<div class="pa-2 d-flex justify-center align-center">
				<v-alert border="left" elevation="2" outlined text type="info" icon="mdi-chevron-left">
					Select an User you want to talk to on the left.
				</v-alert>
			</div>
		</template>
	</v-col>
</template>

<script>
	import { mapGetters } from 'vuex';

	export default {
		data() {
			return {
				message: '',
				disabled: false,
			};
		},
		computed: {
			...mapGetters({
				chat: 'chat/chat',
				messages: 'chat/messages',
			}),
			rows() {
				const rows = [];
				let lastDate = '';
				for (const message of this.messages) {
					const type = message.sender == this.$auth.user.id ? 'sent' : 'received';
					const parts = this.$date.parts(new Date(message.at));
					const currentDate = this.$date.simpleDate(parts);
					// Add a new row if the message is on a different date
					if (lastDate != currentDate) {
						lastDate = currentDate;
						rows.push({ header: currentDate });
					}
					// Message row
					rows.push({
						id: message.id,
						type,
						time: this.$date.simpleTime(parts),
						content: message.content,
					});
				}
				return rows;
			},
			classes() {
				return this.$store.getters['chat/chat'] == undefined ? 'hidden-sm-and-down' : 'd-flex';
			},
		},
		methods: {
			async sendMessage() {
				if (this.message.length > 0 && this.message.length <= 500) {
					this.disabled = true;
					this.$store.dispatch('$nuxtSocket/emit', {
						label: 'socket',
						evt: 'chat/sendMessage',
						msg: {
							chat: this.$store.getters['chat/chat'].id,
							message: this.message,
						},
					});
					this.message = '';
					this.disabled = false;
				}
			},
			leaveChat() {
				this.$store.commit('chat/leaveChat');
			},
			unlike() {
				//
			},
			block() {
				//
			},
			scrollToBottom() {
				if (this.$refs.messages) {
					this.$nextTick(() => {
						this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
					});
				}
			},
		},
		mounted() {
			this.scrollToBottom();
		},
		watch: {
			rows() {
				this.scrollToBottom();
			},
		},
		unmounted() {
			this.$store.dispatch('chat/leaveChat');
		},
	};
</script>

<style scoped>
	.chat {
		display: flex;
		flex-flow: column nowrap;
		height: 100%;
		overflow: auto;
	}

	.v-subheader {
		justify-content: center;
	}

	.messages {
		flex-grow: 0;
		overflow: auto;
	}
</style>
