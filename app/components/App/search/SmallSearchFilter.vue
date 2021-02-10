<template>
	<v-expansion-panel>
		<v-expansion-panel-header>
			<v-row no-gutters>
				<v-col cols="3"> Filter </v-col>
				<v-col cols="3" class="text--secondary">
					<v-icon small>mdi-account-tie</v-icon>
					<template v-if="age[1] < 50">{{ age[0] }} ~ {{ age[1] }}</template>
					<template v-else>{{ age[0] }} ~ <v-icon>mdi-infinity</v-icon></template>
				</v-col>
				<v-col cols="3" class="text--secondary">
					<v-icon small>mdi-map-marker-distance</v-icon>
					<template v-if="distance < 100"> &lsaquo; {{ distance }} km </template>
					<template v-else> &lsaquo; <v-icon>mdi-infinity</v-icon> </template>
				</v-col>
				<v-col cols="3" class="text--secondary">
					<v-icon small>mdi-heart</v-icon>
					<template v-if="likes < 10"> &lsaquo; {{ likes }} </template>
					<template v-else> &lsaquo; <v-icon>mdi-infinity</v-icon> </template>
				</v-col>
			</v-row>
		</v-expansion-panel-header>
		<v-expansion-panel-content>
			<v-range-slider dense v-model="age" min="18" max="50">
				<template v-slot:label>
					<div style="width: 60px">Age</div>
				</template>
			</v-range-slider>
			<v-slider dense v-model="distance" min="0" max="100">
				<template v-slot:label>
					<div style="width: 60px">Distance</div>
				</template>
			</v-slider>
			<v-slider dense v-model="likes" min="0" max="10">
				<template v-slot:label>
					<div style="width: 60px">Likes</div>
				</template>
			</v-slider>
		</v-expansion-panel-content>
	</v-expansion-panel>
</template>

<script>
	export default {
		data: () => ({
			age: [18, 30],
			distance: 10,
			likes: 5,
		}),
	};
</script>

<style scoped></style>
