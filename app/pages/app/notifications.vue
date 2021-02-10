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
		</template>
	</div>
</template>

<script>
	export default {
		auth: true,
		data() {
			return {
				rows2: [
					{ header: 'Tuesday 9 February 2021' },
					{
						id: 1,
						user: { id: 1, username: 'Username' },
						type: 'like:received',
						at: '2021-02-07 22:09:21',
						status: false,
					},
					{
						id: 2,
						user: { id: 1, username: 'Username' },
						type: 'profile:visited',
						at: '2021-02-07 22:09:21',
						status: true,
					},
					{
						id: 3,
						user: { id: 1, username: 'Username' },
						type: 'message:received',
						at: '2021-02-07 22:09:21',
						status: false,
					},
					{ header: 'Tuesday 10 February 2021' },
					{
						id: 4,
						user: { id: 1, username: 'Username' },
						type: 'like:match',
						at: '2021-02-10 22:09:21',
						status: false,
					},
					{
						id: 5,
						user: { id: 1, username: 'Username' },
						type: 'like:removed',
						at: '2021-02-11 22:09:21',
						status: true,
					},
				],
			};
		},
		computed: {
			list() {
				return this.$store.getters['notifications/list'];
			},
			rows() {
				const rows = [];
				let lastDate = '';
				for (const notification of this.list) {
					const date = new Date(notification.at);
					const parts = this.dateParts(date);
					const currentDate = `${parts.weekday} ${parts.day} ${parts.month} ${parts.year}`;
					// Add a new row if the notification is on a different date
					if (lastDate != currentDate) {
						lastDate = currentDate;
						rows.push({ header: currentDate });
					}
					rows.push(notification);
				}
				return rows;
			},
		},
	};
</script>

<style scoped></style>
