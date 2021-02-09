<template>
	<div>
		<template v-if="notifications.length == 0">
			<div class="pa-2">
				<v-alert border="left" elevation="2" outlined text type="info">
					No notifications yet ! Start matching to interact with other peoples.
				</v-alert>
			</div>
		</template>
		<template v-else>
			<v-list two-line>
				<template v-for="item in notifications">
					<template v-if="item.header">
						<v-subheader :key="item.header">{{ item.header }}</v-subheader>
						<v-divider :key="item.header"></v-divider>
					</template>
					<v-list-item v-else :key="item.id">
						<v-list-item-avatar>
							<v-icon>{{ item.icon }}</v-icon>
						</v-list-item-avatar>

						<v-list-item-content>
							<v-list-item-title>
								{{ item.content }}
								<v-tooltip bottom>
									<template v-slot:activator="{ on, attrs }">
										<v-btn color="action" small icon v-bind="attrs" v-on="on">
											<v-icon>mdi-arrow-right</v-icon>
										</v-btn>
									</template>
									<span>Visit User</span>
								</v-tooltip>
							</v-list-item-title>
							<v-list-item-subtitle> {{ new Date(item.at).toLocaleString() }} </v-list-item-subtitle>
						</v-list-item-content>

						<v-list-item-action v-if="!item.read">
							<v-tooltip left>
								<template v-slot:activator="{ on, attrs }">
									<v-btn color="primary" icon v-bind="attrs" v-on="on">
										<v-icon>mdi-check</v-icon>
									</v-btn>
								</template>
								<span>Mark as Read</span>
							</v-tooltip>
						</v-list-item-action>
					</v-list-item>
				</template>
			</v-list>
		</template>
	</div>
</template>

<script>
	export default {
		auth: true,
		data() {
			return {
				// likeReceived, profileVisited, messageReceived, likedBack, likeRemoved
				notifications: [
					{ header: 'Tuesday 9 February 2021' },
					{
						id: 1,
						user: 1,
						type: 'likeReceived',
						icon: 'mdi-heart',
						at: '2021-02-07 22:09:21',
						content: 'You received a like from User1 !',
						read: false,
					},
					{
						id: 2,
						user: 1,
						type: 'profileVisited',
						icon: 'mdi-account-clock',
						at: '2021-02-07 22:09:21',
						content: 'User1 visited your profile !',
						read: true,
					},
					{
						id: 3,
						user: 1,
						type: 'messageReceived',
						icon: 'mdi-email',
						at: '2021-02-07 22:09:21',
						content: 'User1 sent you a message !',
						read: false,
					},
					{ header: 'Tuesday 10 February 2021' },
					{
						id: 4,
						user: 1,
						type: 'likedBack',
						icon: 'mdi-heart-plus',
						at: '2021-02-10 22:09:21',
						content: 'User1 liked your profie !',
						read: false,
					},
					{
						id: 5,
						user: 1,
						type: 'likeRemoved',
						icon: 'mdi-heart-minus',
						at: '2021-02-11 22:09:21',
						content: 'User1 removed his like :(',
						read: true,
					},
				],
			};
		},
	};
</script>

<style scoped></style>
