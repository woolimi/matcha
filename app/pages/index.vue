<template>
	<div>
		<v-btn type="button" @click="apiCall">api</v-btn>
	</div>
</template>

<script>
	export default {
		auth: false,
		methods: {
			async apiCall() {
				const res = await this.$axios.get('http://localhost:5000/test');
			},
		},
	};
</script>
