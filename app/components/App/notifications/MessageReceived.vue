<template>
	<v-list-item>
		<v-list-item-avatar>
			<v-icon>mdi-email</v-icon>
		</v-list-item-avatar>

		<v-list-item-content>
			<v-list-item-title>
				{{ row.user.username }} has sent you a message.
				<v-tooltip bottom>
					<template v-slot:activator="{ on, attrs }">
						<v-btn
							color="action"
							small
							icon
							v-bind="attrs"
							v-on="on"
							@click.prevent="openChat(row.user.id)"
						>
							<v-icon>mdi-arrow-right</v-icon>
						</v-btn>
					</template>
					<span>Open Chat</span>
				</v-tooltip>
			</v-list-item-title>
			<v-list-item-subtitle> {{ new Date(row.at).toLocaleString() }} </v-list-item-subtitle>
		</v-list-item-content>

		<MarkAsRead v-if="!row.status" :id="row.id" />
	</v-list-item>
</template>

<script>
	export default {
		props: { row: { type: Object, required: true } },
		methods: {
			openChat(user) {
				this.$axios.get(`/api/users/chat/user/${user}`).then((response) => {
					if (response.status === 200) {
						this.$router.push(`/app/chat/${response.data.id}`);
					} else console.error(response);
				});
			},
		},
	};
</script>
