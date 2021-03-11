<template>
	<NotificationsList :manageable="true" :navigation="true" :list="list" :emptyMessage="emptyMessage" />
</template>

<script>
	export default {
		auth: true,
		middleware: 'checkVerifiedUser',
		computed: {
			emptyMessage() {
				return 'No notifications yet ! Start matching to interact with other peoples.';
			},
			list() {
				return this.$store.getters['notifications/list'];
			},
		},
	};
</script>
