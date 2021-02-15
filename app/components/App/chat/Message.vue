<template>
	<div :class="`d-flex message ${type}`">
		<div class="d-flex flex-column flex-nowrap">
			<span class="text-caption">{{ time }}</span>
		</div>
		<v-card :class="`ma-2 ${color} ${flash ? 'flash' : ''}`">
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
			flash: {
				type: Boolean,
				required: true,
			},
		},
		computed: {
			color() {
				return this.type == 'received' ? 'white--text' : '';
			},
		},
	};
</script>

<style scoped>
	@keyframes flash {
		0% {
			box-shadow: 0 0 6px 6px rgb(255, 196, 0);
		}
		50% {
			box-shadow: 0 0 6px 6px rgba(255, 196, 0, 0.5);
		}
		100% {
			box-shadow: inherit;
		}
	}

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
		background-color: #3f51b5;
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
	.message.received .v-card.flash,
	.message.sent .v-card.flash {
		animation: flash 5s ease-in;
	}
</style>
