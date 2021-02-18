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
		</v-expansion-panel-content>
	</v-expansion-panel>
</template>

<script>
	import SearchTagMixin from '~/mixins/SearchTagMixin';
	import _ from 'lodash';

	export default {
		mixins: [SearchTagMixin],

		beforeMount() {
			if (!this.$vuetify.breakpoint.smAndDown) return;
			this.$store.dispatch('search/initTagItems');
		},
		watch: {
			selected(newSelected, oldSelected) {
				if (_.isEqual(newSelected, oldSelected)) return;
				if (!this.$vuetify.breakpoint.smAndDown) return;
				this.$store.dispatch('search/updateResult');
			},
		},
	};
</script>

<style scoped></style>
