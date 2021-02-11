<template>
	<div :class="`d-flex message ${type}`">
		<div class="d-flex flex-column flex-nowrap">
			<span class="text-caption">{{ time }}</span>
		</div>
		<v-card :color="color" class="ma-2">
			<div class="content pa-2">{{ content }}</div>
		</v-card>
	</div>
</template>

<script>
	export default {
		props: {
			type: {
				type: String,
				required: true,
			},
			time: {
				type: String,
				required: true,
			},
			content: {
				type: String,
				required: true,
			},
		},
		computed: {
			color() {
				return this.type == 'received' ? 'blue' : '';
			},
		},
	};
</script>

<style scoped>
	.message {
		width: auto;
		max-width: 50%;
		align-items: center;
		position: relative;
	}
	.message.received .v-card:first-child {
		margin-left: 40px;
	}
	.message.received .v-card {
		border-top-right-radius: 1rem;
		border-bottom-right-radius: 1rem;
		border-bottom-left-radius: 1rem;
	}
	.message.sent {
		align-self: flex-end;
		flex-direction: row-reverse;
	}
	.message.sent .v-card {
		border-top-right-radius: 1rem;
		border-top-left-radius: 1rem;
		border-bottom-left-radius: 1rem;
	}
</style>
