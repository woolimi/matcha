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
					<MessageReceived v-else-if="row.type == 'message:received'" manageable :row="row" :key="row.id" />
					<ProfileVisited v-else-if="row.type == 'profile:visited'" manageable :row="row" :key="row.id" />
					<LikeReceived v-else-if="row.type == 'like:received'" manageable :row="row" :key="row.id" />
					<LikedBack v-else-if="row.type == 'like:match'" manageable :row="row" :key="row.id" />
					<LikeRemoved v-else-if="row.type == 'like:removed'" manageable :row="row" :key="row.id" />
				</template>
			</v-list>
			<v-btn
				v-if="manageable && unreadNotifications.length > 0"
				color="primary"
				class="mark-all"
				@click="markAllAsRead"
			>
				Mark All as Read
			</v-btn>
		</template>
	</div>
</template>

<script>
	export default {
		props: {
			manageable: {
				type: Boolean,
				required: true,
			},
			list: {
				type: Array,
				required: true,
			},
		},
		computed: {
			unreadNotifications() {
				return this.list.filter((n) => !n.status);
			},
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
				if (this.manageable) {
					this.$store.dispatch('notifications/markAllAsRead');
				}
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
