<template>
	<v-list-item-action>
		<v-tooltip left>
			<template v-slot:activator="{ on, attrs }">
				<v-btn color="primary" icon v-bind="attrs" v-on="on" @click="markAsRead">
					<v-icon>mdi-check</v-icon>
				</v-btn>
			</template>
			<span>Mark as Read</span>
		</v-tooltip>
	</v-list-item-action>
</template>

<script>
	export default {
		props: { id: { type: Number, required: true } },
		methods: {
			markAsRead() {
				this.$store.dispatch('notifications/markAsRead', this.id);
			},
		},
	};
</script>
