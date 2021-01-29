<template>
	<v-row no-gutters align="stretch">
		<v-col cols="3" style="border-right: 1px solid rgba(0, 0, 0, 0.12)">
			<template v-if="users.length > 0">
				<v-list>
					<v-list-item-group>
						<v-list-item v-for="user in users" :key="user.avatar" @click="currentUser = user">
							<v-list-item-avatar>
								<v-badge
									:color="user.online ? 'green' : 'pink'"
									bordered
									avatar
									dot
									bottom
									offset-x="10"
									offset-y="10"
								>
									<v-avatar size="40">
										<v-img :src="user.avatar"></v-img>
									</v-avatar>
								</v-badge>
							</v-list-item-avatar>
							<v-list-item-content>
								<v-list-item-title>
									{{ user.username }}
								</v-list-item-title>
								<v-list-item-subtitle
									>{{ user.date.toDateString() }} &mdash;
									{{ user.date.toLocaleTimeString() }}</v-list-item-subtitle
								>
							</v-list-item-content>
						</v-list-item>
					</v-list-item-group>
				</v-list>
			</template>
			<template v-else>
				<div class="pa-2">
					<v-alert border="left" elevation="2" outlined text type="info"
						>Start matching to chat with other peoples !</v-alert
					>
				</div>
			</template>
		</v-col>
		<v-col cols="9" class="d-flex flex-column flex-nowrap" style="overflow: hidden">
			<template v-if="currentUser">
				<v-toolbar class="flex-grow-0">
					<v-badge
						:color="currentUser.online ? 'green' : 'pink'"
						bordered
						avatar
						dot
						bottom
						offset-x="10"
						offset-y="10"
						class="mx-2"
					>
						<v-avatar size="50">
							<v-img :src="currentUser.avatar"></v-img>
						</v-avatar>
					</v-badge>
					<v-toolbar-title>{{ currentUser.username }}</v-toolbar-title>

					<v-spacer></v-spacer>

					<v-btn text outline color="pink"> <v-icon>mdi-heart</v-icon> Unlike </v-btn>
					<v-btn text outline color="error"> <v-icon>mdi-cancel</v-icon> Block </v-btn>
				</v-toolbar>
				<v-container
					class="messages grey d-flex flex-grow-1 flex-shrink-0 flex-column flex-fill lighten-5 mb-0"
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
								pulvinar maximus mauris nec imperdiet. Maecenas eget risus nec mauris egestas feugiat
								eget sed nunc. Curabitur eget eros congue, sagittis tortor eu, facilisis elit. Cras at
								diam at risus vulputate cursus luctus in sem. Phasellus eleifend accumsan dolor sed
								lacinia. Nunc dapibus sodales sapien eget fringilla. Maecenas erat enim, blandit vel
								ultricies vitae, ultricies non odio.
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
				<v-container fluid class="d-flex justify-center flex-grow-0 align-center flex-nowrap elevation-4">
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
					<v-alert border="left" elevation="2" outlined text type="info" icon="mdi-chevron-left"
						>Select an User you want to talk to on the left.</v-alert
					>
				</div>
			</template>
		</v-col>
	</v-row>
</template>

<script>
	export default {
		auth: true,
		data() {
			return {
				message: '',
				currentUser: undefined,
				self: {
					avatar: `https://avatars.dicebear.com/4.5/api/male/1.svg`,
					username: 'Username',
					message: 'Last message',
					date: new Date(),
					online: true,
				},
				users: [
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/1.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
						online: true,
					},
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/2.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
						online: true,
					},
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/3.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
					},
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/4.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
					},
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/5.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
						online: true,
					},
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/6.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
						online: true,
					},
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/7.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
					},
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/8.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
						online: true,
					},
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/9.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
					},
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/10.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
						online: true,
					},
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/11.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
					},
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/12.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
						online: true,
					},
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/13.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
					},
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/14.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
						online: true,
					},
					{
						avatar: `https://avatars.dicebear.com/4.5/api/female/15.svg`,
						username: 'Username',
						message: 'Last message',
						date: new Date(),
					},
				],
			};
		},
	};
</script>

<style scoped>
	.v-list-item .v-avatar {
		overflow: visible;
	}

	.v-subheader {
		justify-content: center;
	}

	.messages {
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
