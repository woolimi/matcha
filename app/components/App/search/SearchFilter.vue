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
				<v-slider dense v-model.lazy="distance" min="0" max="100" track-color="grey"></v-slider>

				<v-subheader class="pa-0 h-init">
					<span class="font-weight-bold"> Likes </span>
					<v-spacer></v-spacer>
					<span v-if="likes >= 10"> <v-icon small>mdi-less-than</v-icon> <v-icon>mdi-infinity</v-icon> </span>
					<span v-else><v-icon small>mdi-less-than</v-icon> {{ likes }}</span>
				</v-subheader>
				<v-slider dense v-model.lazy="likes" min="0" max="10" track-color="grey"></v-slider>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
	export default {
		computed: {
			age: {
				get() {
					return this.$store.state.search.age;
				},
				set(val) {
					this.$store.commit('search/SET_AGE', val);
				},
			},
			distance: {
				get() {
					return this.$store.state.search.distance;
				},
				set(val) {
					this.$store.commit('search/SET_DISTANCE', val);
				},
			},
			likes: {
				get() {
					return this.$store.state.search.likes;
				},
				set(val) {
					this.$store.commit('search/SET_LIKES', val);
				},
			},
		},
	};
</script>

<style scoped>
	.h-init {
		height: initial;
	}
</style>
