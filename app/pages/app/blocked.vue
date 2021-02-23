<template>
	<div>
		<template v-if="rows.length == 0">
			<div class="pa-2">
				<v-alert border="left" elevation="2" colored-border light type="info"> No blocked Users, yet. </v-alert>
			</div>
		</template>
		<template v-else>
			<v-list two-line>
				<template v-for="row in rows">
					<template v-if="row.header">
						<v-subheader :key="row.header">{{ row.header }}</v-subheader>
						<v-divider :key="`div_${row.header}`"></v-divider>
					</template>
					<v-list-item :key="row.id" v-else>
						<v-list-item-avatar>
							<v-icon>mdi-cancel</v-icon>
						</v-list-item-avatar>

						<v-list-item-content>
							<v-list-item-title> {{ row.user.firstName }} {{ row.user.lastName }} </v-list-item-title>
							<v-list-item-subtitle> {{ new Date(row.at).toLocaleString() }} </v-list-item-subtitle>
						</v-list-item-content>

						<v-list-item-action>
							<v-tooltip left>
								<template v-slot:activator="{ on, attrs }">
									<v-btn color="primary" icon v-bind="attrs" v-on="on" @click="unblock(row)">
										<v-icon>mdi-check</v-icon>
									</v-btn>
								</template>
								<span>Unblock User</span>
							</v-tooltip>
						</v-list-item-action>
					</v-list-item>
				</template>
			</v-list>
		</template>
	</div>
</template>

<script>
	export default {
		auth: true,
		middleware: 'checkVerfiedUser',
		async fetch() {
			await this.$store.dispatch('blocked/loadList');
		},
		computed: {
			list() {
				return this.$store.getters['blocked/list'];
			},
			// Add a new row if the block happened on a different date
			rows() {
				const rows = [];
				let lastDate = '';
				for (const block of this.list) {
					const currentDate = this.$date.simpleDate(block.at);
					if (lastDate != currentDate) {
						lastDate = currentDate;
						rows.push({ header: currentDate });
					}
					rows.push(block);
				}
				return rows;
			},
		},
		methods: {
			unblock(row) {
				this.$store.dispatch('blocked/toggle', row.user.id);
			},
		},
	};
</script>
