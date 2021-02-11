<template>
	<v-list-item>
		<v-list-item-avatar>
			<v-icon>mdi-heart-minus</v-icon>
		</v-list-item-avatar>

		<v-list-item-content>
			<v-list-item-title> {{ row.user.username }} removed his like. </v-list-item-title>
			<v-list-item-subtitle> {{ new Date(row.at).toLocaleString() }} </v-list-item-subtitle>
		</v-list-item-content>

		<MarkAsRead v-if="!row.status" :id="row.id" />
	</v-list-item>
</template>

<script>
	export default {
		props: { row: { type: Object, required: true } },
	};
</script>
