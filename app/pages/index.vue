<template>
	<HomeReviews />
</template>

<script>
	export default {
		auth: false,
		mounted() {
			if (this.$auth.loggedIn) {
				this.$router.replace('/app/search');
			}
		},
	};
</script>
