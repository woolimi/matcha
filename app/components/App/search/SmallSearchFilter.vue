<template>
	<v-expansion-panel>
		<v-expansion-panel-header>
			<v-row no-gutters>
				<v-col cols="3" class="d-flex align-center"> Filter </v-col>
				<v-col cols="3" class="text--secondary d-flex align-center">
					<v-icon small>mdi-account-tie</v-icon>
					<span v-if="age[1] < 50" class="d-flex align-center">{{ age[0] }} ~ {{ age[1] }}</span>
					<span v-else class="d-flex align-center">{{ age[0] }} ~ &nbsp;<v-icon>mdi-infinity</v-icon></span>
				</v-col>
				<v-col cols="3" class="text--secondary d-flex align-center">
					<v-icon small>mdi-map-marker-distance</v-icon>
					<span v-if="distance < 100" class="d-flex align-center">
						<v-icon small>mdi-less-than</v-icon> {{ distance }} km
					</span>
					<span v-else class="d-flex align-center">
						<v-icon small>mdi-less-than</v-icon> <v-icon>mdi-infinity</v-icon>
					</span>
				</v-col>
				<v-col cols="3" class="text--secondary d-flex align-center">
					<v-icon small>mdi-heart</v-icon>
					<span v-if="likes < 10" class="d-flex align-center">
						<v-icon small>mdi-less-than</v-icon> {{ likes }}
					</span>
					<span v-else class="d-flex align-center">
						<v-icon small>mdi-less-than</v-icon> <v-icon>mdi-infinity</v-icon>
					</span>
				</v-col>
			</v-row>
		</v-expansion-panel-header>
		<v-expansion-panel-content>
			<v-range-slider dense v-model="age" min="18" max="50" track-color="grey">
				<template v-slot:label>
					<div style="width: 60px">Age</div>
				</template>
			</v-range-slider>
			<v-slider dense v-model="distance" min="0" max="100" track-color="grey">
				<template v-slot:label>
					<div style="width: 60px">Distance</div>
				</template>
			</v-slider>
			<v-slider dense v-model="likes" min="0" max="10" track-color="grey">
				<template v-slot:label>
					<div style="width: 60px">Likes</div>
				</template>
			</v-slider>
		</v-expansion-panel-content>
	</v-expansion-panel>
</template>

<script>
	import SearchFilterMixin from '~/mixins/SearchFilterMixin';
	export default {
		mixins: [SearchFilterMixin],
	};
</script>

<style scoped></style>
