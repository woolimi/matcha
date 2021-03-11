<template>
	<Chat />
</template>

<script>
	export default {
		auth: true,
		middleware: 'checkVerifiedUser',
		computed: {
			id() {
				return this.$route.params.id;
			},
			loaded() {
				return this.$store.getters['chat/loadedList'];
			},
		},
		mounted() {
			if (this.id) {
				this.$store.dispatch('chat/loadChat', this.id);
			}
		},
		watch: {
			id(to, from) {
				if (to && to != from) {
					this.$store.dispatch('chat/loadChat', to);
				}
			},
			loaded(to, from) {
				if (!from && to && this.id) {
					this.$store.dispatch('chat/loadChat', this.id);
				}
			},
		},
	};
</script>
