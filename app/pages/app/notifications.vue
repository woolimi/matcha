<template>
	<div>
		<template v-if="rows.length == 0">
			<div class="pa-2">
				<v-alert border="left" elevation="2" outlined text type="info">
					No notifications yet ! Start matching to interact with other peoples.
				</v-alert>
			</div>
		</template>
		<template v-else>
			<v-list two-line>
				<template v-for="row in rows">
					<template v-if="row.header">
						<v-subheader :key="row.header">{{ row.header }}</v-subheader>
						<v-divider :key="`div_${row.header}`"></v-divider>
					</template>
					<MessageReceived v-else-if="row.type == 'message:received'" :row="row" :key="row.id" />
					<ProfileVisited v-else-if="row.type == 'profile:visited'" :row="row" :key="row.id" />
					<LikeReceived v-else-if="row.type == 'like:received'" :row="row" :key="row.id" />
					<LikedBack v-else-if="row.type == 'like:match'" :row="row" :key="row.id" />
					<LikeRemoved v-else-if="row.type == 'like:removed'" :row="row" :key="row.id" />
				</template>
			</v-list>
			<v-btn v-if="unreadNotifications.length > 0" color="primary" class="mark-all" @click="markAllAsRead">
				Mark All as Read
			</v-btn>
		</template>
	</div>
</template>

<script>
	import { mapGetters } from 'vuex';

	export default {
		auth: true,
		computed: {
			...mapGetters({
				list: 'notifications/list',
				unreadNotifications: 'notifications/unread',
			}),
			rows() {
				// Add a new row if the notification is on a different date
				const rows = [];
				let lastDate = '';
				for (const notification of this.list) {
					const currentDate = this.$date.simpleDate(notification.at);
					if (lastDate != currentDate) {
						lastDate = currentDate;
						rows.push({ header: currentDate });
					}
					rows.push(notification);
				}
				return rows;
			},
		},
		methods: {
			markAllAsRead() {
				this.$store.dispatch('chat');
			},
		},
	};
</script>

<style scoped>
	.mark-all {
		position: sticky;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
	}
</style>
