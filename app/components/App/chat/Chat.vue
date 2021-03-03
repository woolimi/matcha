<template>
	<v-col cols="12" md="9" class="chat" :class="classes">
		<template v-if="chat">
			<v-toolbar class="flex-grow-0" style="z-index: 1">
				<NuxtLink to="/app/chat">
					<v-icon class="hidden-md-and-up" @click="leaveChat">mdi-chevron-left</v-icon>
				</NuxtLink>

				<NuxtLink :to="`/app/users/${chat.user.id}`">
					<v-tooltip bottom>
						<template v-slot:activator="{ on, attrs }">
							<v-badge
								:color="chat.user.online === true ? 'green' : 'pink'"
								bordered
								avatar
								dot
								bottom
								offset-x="10"
								offset-y="10"
								class="mx-2"
							>
								<v-avatar size="50" v-bind="attrs" v-on="on">
									<v-img :src="chat.user.picture"></v-img>
								</v-avatar>
							</v-badge>
						</template>
						{{ online }}
					</v-tooltip>
					<v-toolbar-title>{{ chat.user.firstName }} {{ chat.user.lastName }}</v-toolbar-title>
				</NuxtLink>

				<v-spacer></v-spacer>

				<v-btn dark color="pink" class="mr-2" @click="unlike"> <v-icon left>mdi-heart</v-icon> Unlike </v-btn>
				<v-btn dark color="orange" @click="block"> <v-icon left>mdi-cancel</v-icon> Block </v-btn>
			</v-toolbar>
			<v-container
				fluid
				ref="messages"
				class="messages d-flex flex-grow-1 flex-shrink-1 flex-column flex-fill mb-0"
				@scroll.passive="onScroll"
			>
				<div class="loading" v-show="!loadedChat || loadingMore">
					<v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
				</div>
				<template v-for="row in rows">
					<template v-if="row.header">
						<v-subheader :key="row.header">{{ row.header }}</v-subheader>
						<v-divider :key="`div_${row.header}`"></v-divider>
					</template>
					<Message
						v-else
						:type="row.type"
						:time="row.time"
						:content="row.content"
						:flash="isNewRow(row.id)"
						:key="row.id"
					/>
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
				<v-alert border="left" elevation="2" colored-border light type="info" icon="mdi-chevron-left">
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
				lastHeight: 0,
				newRows: [],
			};
		},
		computed: {
			...mapGetters({
				chat: 'chat/chat',
				messages: 'chat/messages',
				loadedChat: 'chat/loadedChat',
				loadingMore: 'chat/loadingMore',
				completed: 'chat/completed',
				lastEvent: 'chat/lastEvent',
			}),
			rows() {
				const rows = [];
				if (this.messages.length > 0) {
					if (this.messages.length < 20 || this.completed) {
						rows.push({ header: 'Your conversation starts here !' });
					}
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
				} else rows.push({ header: 'No messages yet !' });
				return rows;
			},
			online() {
				return this.chat.user.online === true
					? 'Online'
					: typeof this.chat.user.online === 'string'
					? this.$date.simpleDate(this.chat.user.online)
					: 'Offline';
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
				const id = this.chat.id;
				this.$axios.post(`/api/like/${this.chat.user.id}`).then(async (response) => {
					if (response.status == 200) {
						this.$store.commit('chat/removeChat', id);
						this.$store.commit('chat/leaveChat');
						this.$router.push({ path: `/app/chat` });
						this.$store.commit('snackbar/SHOW', {
							message: 'User unliked',
							color: 'success',
						});
					} else {
						this.$store.commit('snackbar/SHOW', {
							message: 'Could not Unlike User.',
							color: 'error',
						});
					}
				});
			},
			async block() {
				const status = await this.$store.dispatch('blocked/toggle', this.chat.user.id);
				if (status) {
					this.$store.commit('chat/leaveChat');
					this.$router.push({ path: `/app/chat` });
				}
			},
			onScroll() {
				if (
					this.$refs?.messages &&
					this.$refs.messages.scrollTop == 0 &&
					!this.loadingMore &&
					!this.completed
				) {
					this.$store.dispatch('chat/loadMore');
				}
			},
			scrollToBottom() {
				this.$nextTick(() => {
					if (this.$refs.messages) {
						this.$refs.messages.scrollTo({
							top: this.$refs.messages.scrollHeight,
							behavior: 'smooth',
						});
					}
				});
			},
			isNewRow(id) {
				return this.newRows.indexOf(id) >= 0;
			},
		},
		watch: {
			loadingMore(to, _from) {
				// Save the current scroll height before updates
				if (to) {
					this.lastHeight = this.$refs.messages.scrollHeight;
				} else {
					// Get new scrollHeight after it's rendered
					this.$nextTick(() => {
						if (this.$refs.messages) {
							this.$refs.messages.scrollTo({
								top:
									this.$refs.messages.scrollHeight -
									this.lastHeight -
									this.$refs.messages.offsetHeight / 3,
							});
						}
					});
				}
			},
			rows(to, from) {
				this.newRows = [];
				if (this.lastEvent != 'initialLoad') {
					for (const row of to) {
						if (from.find((r) => !r.header && r.id == row.id) === undefined) {
							this.newRows.push(row.id);
						}
					}
				}
				if (this.lastEvent == 'newMessage' || this.lastEvent == 'initialLoad') {
					this.scrollToBottom();
				}
			},
		},
		unmounted() {
			this.newRows.length = 0;
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
		position: relative;
	}

	.v-subheader {
		justify-content: center;
	}

	.messages {
		flex-grow: 0;
		overflow: auto;
	}

	.loading {
		text-align: center;
	}
</style>
