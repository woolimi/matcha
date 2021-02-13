<template>
	<v-container>
		<v-card elevation="4">
			<v-card-text>
				<v-subheader class="pa-0 h-init font-weight-bold">Tags</v-subheader>
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
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
	export default {
		data() {
			return {
				tags: {
					selected: [],
					items: ['a', 'b'],
					search: null,
				},
			};
		},
	};
</script>

<style scoped></style>
