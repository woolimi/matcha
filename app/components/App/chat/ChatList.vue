<template>
	<v-col cols="12" md="3" :class="classes">
		<template v-if="chatList.length > 0">
			<v-list width="100%">
				<v-list-item-group>
					<v-list-item v-for="chat in chatList" :key="chat.id" @click="selectChat(chat)">
						<v-list-item-avatar>
							<v-badge
								:color="chat.user.online ? 'green' : 'pink'"
								bordered
								avatar
								dot
								bottom
								offset-x="10"
								offset-y="10"
							>
								<v-avatar size="40">
									<v-img :src="chat.user.picture ? chat.user.picture : ''"></v-img>
								</v-avatar>
							</v-badge>
						</v-list-item-avatar>
						<v-list-item-content>
							<v-list-item-title>
								{{ chat.user.username }}
							</v-list-item-title>
							<v-list-item-subtitle>{{
								chat.last ? new Date(chat.last).toLocaleString() : 'No messages'
							}}</v-list-item-subtitle>
						</v-list-item-content>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</template>
		<template v-else>
			<div class="pa-2">
				<v-alert border="left" elevation="2" outlined text type="info">
					Start matching to chat with other peoples !
				</v-alert>
			</div>
		</template>
	</v-col>
</template>

<script>
	export default {
		computed: {
			chatList() {
				return this.$store.getters['chat/list'];
			},
			classes() {
				return `${
					this.$store.getters['chat/chat'] == undefined ? 'd-flex' : 'hidden-sm-and-down'
				} chat-list justify-center`;
			},
		},
		methods: {
			selectChat(chat) {
				this.$store.dispatch('chat/loadChat', chat);
			},
		},
		beforeMount() {
			this.$store.dispatch('chat/loadList');
		},
	};
</script>

<style scoped>
	.chat-list {
		height: 100%;
		overflow: auto;
		border-right: 1px solid rgba(0, 0, 0, 0.12);
	}

	.v-list-item .v-avatar {
		overflow: visible;
	}
</style>
