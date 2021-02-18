<template>
	<v-container>
		<v-card elevation="4">
			<v-card-text>
				<v-subheader class="pa-0 h-init font-weight-bold">Tags</v-subheader>
				<v-autocomplete
					v-model="selected"
					chips
					multiple
					hide-selected
					auto-select-first
					@change="search = null"
					:items="items"
					:search-input.sync="search"
				>
				</v-autocomplete>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
	import SearchTagMixin from '~/mixins/SearchTagMixin';
	import _ from 'lodash';

	export default {
		mixins: [SearchTagMixin],
		watch: {
			selected(newSelected, oldSelected) {
				if (_.isEqual(newSelected, oldSelected)) return;
				if (!this.$vuetify.breakpoint.mdAndUp) return;
				this.$store.dispatch('search/updateResult');
			},
		},
	};
</script>

<style scoped></style>
