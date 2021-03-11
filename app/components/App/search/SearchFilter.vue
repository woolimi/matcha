<template>
	<v-container>
		<v-card elevation="4">
			<v-card-text>
				<v-subheader class="pa-0 h-init">
					<span class="font-weight-bold">Age</span>
					<v-spacer></v-spacer>
					<span v-if="age[1] < 50">{{ age[0] }} ~ {{ age[1] }}</span>
					<span v-else>{{ age[0] }} ~ &nbsp;<v-icon>mdi-infinity</v-icon></span>
				</v-subheader>
				<v-range-slider dense v-model.lazy="age" min="18" max="50" track-color="grey"> </v-range-slider>

				<v-subheader class="pa-0 h-init">
					<span class="font-weight-bold">Distance</span>
					<v-spacer></v-spacer>
					<span v-if="distance >= 100" class="d-flex align-center">
						<v-icon small>mdi-less-than</v-icon> <v-icon>mdi-infinity</v-icon> &nbsp; km
					</span>
					<span v-else><v-icon small>mdi-less-than</v-icon> {{ distance }} km</span>
				</v-subheader>
				<v-slider dense v-model.lazy="distance" ticks step="5" min="0" max="100" track-color="grey"></v-slider>

				<v-subheader class="pa-0 h-init">
					<span class="font-weight-bold"> Fame </span>
					<v-spacer></v-spacer>
					<span v-if="fame[1] < 50">{{ fame[0] }} ~ {{ fame[1] }}</span>
					<span v-else>{{ fame[0] }} ~ &nbsp;<v-icon>mdi-infinity</v-icon></span>
				</v-subheader>
				<v-range-slider dense v-model.lazy="fame" step="5" min="0" max="50" track-color="grey"></v-range-slider>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
	import SearchFilterMixin from '~/mixins/SearchFilterMixin';
	import _ from 'lodash';

	export default {
		mixins: [SearchFilterMixin],
		watch: {
			age(newData, oldData) {
				if (_.isEqual(newData, oldData)) return;
				if (!this.$vuetify.breakpoint.mdAndUp) return;
				this.$store.dispatch('search/updateResult');
			},
			distance(newData, oldData) {
				if (_.isEqual(newData, oldData)) return;
				if (!this.$vuetify.breakpoint.mdAndUp) return;
				this.$store.dispatch('search/updateResult');
			},
			fame(newData, oldData) {
				if (_.isEqual(newData, oldData)) return;
				if (!this.$vuetify.breakpoint.mdAndUp) return;
				this.$store.dispatch('search/updateResult');
			},
		},
	};
</script>

<style scoped>
	.h-init {
		height: initial;
	}
</style>
