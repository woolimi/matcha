<template>
	<v-list-item>
		<v-list-item-avatar>
			<v-icon>mdi-heart-minus</v-icon>
		</v-list-item-avatar>

		<v-list-item-content>
			<v-list-item-title> {{ row.user.username }} removed his like. </v-list-item-title>
			<v-list-item-subtitle> {{ new Date(row.at).toLocaleString() }} </v-list-item-subtitle>
		</v-list-item-content>

		<v-list-item-action v-if="!row.status">
			<v-tooltip left>
				<template v-slot:activator="{ on, attrs }">
					<v-btn color="primary" icon v-bind="attrs" v-on="on">
						<v-icon>mdi-check</v-icon>
					</v-btn>
				</template>
				<span>Mark as Read</span>
			</v-tooltip>
		</v-list-item-action>
	</v-list-item>
</template>

<script>
	export default {
		props: { row: { type: Object, required: true } },
	};
</script>
