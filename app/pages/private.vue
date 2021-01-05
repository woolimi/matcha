<template>
	<div>
		<div>Here is private page. Login need.</div>
		<pre>{{ this.$auth.user }}</pre>
	</div>
</template>

<script>
	export default {
		auth: true,
	};
</script>

<style scoped></style>
