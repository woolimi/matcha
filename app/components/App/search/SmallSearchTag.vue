<template>
	<v-expansion-panel>
		<v-expansion-panel-header>
			<v-row no-gutters>
				<v-col cols="12"> Tags </v-col>
				<v-col cols="6" class="text--secondary"> </v-col>
			</v-row>
		</v-expansion-panel-header>
		<v-expansion-panel-content>
			<v-autocomplete
				v-model="tags.selected"
				chips
				multiple
				hide-selected
				auto-select-first
				@change="tags.search = null"
				:items="tags.items"
				:search-input.sync="tags.search"
			>
			</v-autocomplete>
		</v-expansion-panel-content>
	</v-expansion-panel>
</template>

<script>
	export default {
		data: () => ({
			tags: {
				selected: [],
				items: ['a', 'b'],
				search: null,
			},
		}),
	};
</script>

<style lang="scss" scoped></style>
