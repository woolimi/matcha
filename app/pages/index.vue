<template>
	<HomeReviews />
</template>

<script>
	export default {
		auth: false,
		mounted() {
			if (this.$auth.loggedIn) {
				this.$route.replace('/app/search');
			}
		},
	};
</script>
