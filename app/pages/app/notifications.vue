<template>
	<NotificationsList :manageable="true" :list="list" />
</template>

<script>
	export default {
		auth: true,
		computed: {
			list() {
				return this.$store.getters['notifications/list'];
			},
		},
	};
</script>
