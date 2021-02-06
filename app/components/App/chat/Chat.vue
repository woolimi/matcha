<template>
	<v-col cols="12" md="9" :class="classes">
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
				<v-subheader> Tuesday, 28 January 2021 </v-subheader>
				<div class="d-flex message received">
					<div class="d-flex flex-column flex-nowrap">
						<span class="text-caption">12:04</span>
					</div>
					<v-card color="blue" class="ma-2">
						<div class="content pa-2">Received message</div>
					</v-card>
				</div>
				<div class="d-flex message sent">
					<div class="d-flex flex-column flex-nowrap">
						<span class="text-caption">12:05</span>
					</div>
					<v-card class="ma-2">
						<div class="content pa-2">Sent message</div>
					</v-card>
				</div>
				<v-subheader> Tuesday, 29 January 2021 </v-subheader>
				<div class="d-flex message received">
					<div class="d-flex flex-column flex-nowrap">
						<span class="text-caption">12:06</span>
					</div>
					<v-card color="blue" class="ma-2">
						<div class="content pa-2">
							Received very long message. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
							pulvinar maximus mauris nec imperdiet. Maecenas eget risus nec mauris egestas feugiat eget
							sed nunc. Curabitur eget eros congue, sagittis tortor eu, facilisis elit. Cras at diam at
							risus vulputate cursus luctus in sem. Phasellus eleifend accumsan dolor sed lacinia. Nunc
							dapibus sodales sapien eget fringilla. Maecenas erat enim, blandit vel ultricies vitae,
							ultricies non odio.
						</div>
					</v-card>
				</div>
				<div class="d-flex message received">
					<div class="d-flex flex-column flex-nowrap">
						<span class="text-caption">12:07</span>
					</div>
					<v-card color="blue" class="ma-2">
						<div class="content pa-2">Received message</div>
					</v-card>
				</div>
				<div v-for="n in 20" :key="n" class="d-flex message sent">
					<div class="d-flex flex-column flex-nowrap">
						<span class="text-caption">12:{{ 10 + n }}</span>
					</div>
					<v-card class="ma-2">
						<div class="content pa-2">Sent message</div>
					</v-card>
				</div>
			</v-container>
			<v-container
				fluid
				class="d-flex justify-center flex-grow-0 align-center flex-nowrap elevation-4 message-input"
			>
				<!--<v-avatar size="40"> <v-img :src="self.avatar"></v-img> </v-avatar>-->
				<v-text-field
					v-model="message"
					append-outer-icon="mdi-send"
					filled
					label="Message"
					type="text"
					dense
					hide-details
					class="mb-0"
				></v-text-field>
			</v-container>
		</template>
		<template v-else>
			<div class="pa-2" style="display: flex; justify-content: center; align-items: center">
				<v-alert border="left" elevation="2" outlined text type="info" icon="mdi-chevron-left">
					Select an User you want to talk to on the left.
				</v-alert>
			</div>
		</template>
	</v-col>
</template>

<script>
	export default {
		data() {
			return {
				message: '',
			};
		},
		computed: {
			chat() {
				return this.$store.getters['chat/chat'];
			},
			classes() {
				return `${this.$store.getters['chat/chat'] ? 'hidden-sm-and-down' : 'd-flex'} chat`;
			},
		},
		methods: {
			leaveChat() {
				//
			},
			unlike() {
				//
			},
			block() {
				//
			},
			scrollToBottom() {
				this.$nextTick(() => {
					this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
				});
			},
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
	.message {
		width: auto;
		max-width: 50%;
		align-items: center;
		position: relative;
	}
	.message.received .v-card:first-child {
		margin-left: 40px;
	}
	.message.received .v-card {
		border-top-right-radius: 1rem;
		border-bottom-right-radius: 1rem;
		border-bottom-left-radius: 1rem;
	}
	.message.sent {
		align-self: flex-end;
		flex-direction: row-reverse;
	}
	.message.sent .v-card {
		border-top-right-radius: 1rem;
		border-top-left-radius: 1rem;
		border-bottom-left-radius: 1rem;
	}
</style>
