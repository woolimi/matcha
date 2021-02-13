<template>
	<v-container>
		<v-card elevation="4">
			<v-card-text>
				<v-subheader class="pa-0 h-init font-weight-bold">
					<span>Age</span>
					<v-spacer></v-spacer>
					<span>{{ age[0] }} - {{ age[1] }}</span>
				</v-subheader>
				<v-range-slider dense v-model="age" min="18" max="50"> </v-range-slider>
				<v-subheader class="pa-0 h-init font-weight-bold">
					<span>Distance</span>
					<v-spacer></v-spacer>
					<span>{{ distance[0] }} - {{ distance[1] }} km</span>
				</v-subheader>
				<v-range-slider dense v-model="distance" min="0" max="100"></v-range-slider>
				<v-subheader class="pa-0 h-init font-weight-bold">
					<span> Likes </span>
					<v-spacer></v-spacer>
					<span>{{ likes[0] }} - {{ likes[1] }}</span>
				</v-subheader>
				<v-range-slider dense v-model="likes" min="0" max="100"></v-range-slider>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
	export default {
		data() {
			return {
				age: [18, 30],
				distance: [0, 30],
				likes: [0, 30],
				tags: {
					selected: [],
					items: ['a', 'b'],
					search: null,
				},
				mode: 1,
			};
		},
	};
</script>

<style scoped></style>
