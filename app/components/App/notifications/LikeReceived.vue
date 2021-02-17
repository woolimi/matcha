<template>
	<v-list-item>
		<v-list-item-avatar>
			<v-icon>mdi-heart-plus</v-icon>
		</v-list-item-avatar>

		<v-list-item-content>
			<v-list-item-title>
				{{ row.user.firstName }} {{ row.user.lastName }} liked your profile.
				<v-tooltip bottom>
					<template v-slot:activator="{ on, attrs }">
						<v-btn :to="`/app/users/${row.user.id}`" color="action" small icon v-bind="attrs" v-on="on">
							<v-icon>mdi-arrow-right</v-icon>
						</v-btn>
					</template>
					<span>Visit {{ row.user.firstName }} {{ row.user.lastName }}</span>
				</v-tooltip>
			</v-list-item-title>
			<v-list-item-subtitle> {{ new Date(row.at).toLocaleString() }} </v-list-item-subtitle>
		</v-list-item-content>

		<MarkAsRead v-if="manageable && !row.status" :id="row.id" />
	</v-list-item>
</template>

<script>
	export default {
		props: {
			row: { type: Object, required: true },
			manageable: { type: Boolean, required: true },
		},
	};
</script>
