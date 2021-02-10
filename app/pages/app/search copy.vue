<template>
	<v-container style="height: 100%" fluid>
		<v-row>
			<v-col cols="12" sm="4">
				<v-row>
					<v-col cols="12">
						<v-card elevation="4" width="100%">
							<v-card-text>
								<v-subheader class="pa-0 h-init">
									<span>Age</span>
									<v-spacer></v-spacer>
									<span>{{ age[0] }} - {{ age[1] }}</span>
								</v-subheader>
								<v-range-slider dense v-model="age" min="18" max="50"> </v-range-slider>
								<v-subheader class="pa-0 h-init">
									<span>Distance</span>
									<v-spacer></v-spacer>
									<span>{{ distance[0] }} - {{ distance[1] }} km</span>
								</v-subheader>
								<v-range-slider dense v-model="distance" min="0" max="100"></v-range-slider>
								<v-subheader class="pa-0 h-init">
									<span> Likes </span>
									<v-spacer></v-spacer>
									<span>{{ likes[0] }} - {{ likes[1] }}</span>
								</v-subheader>
								<v-range-slider dense v-model="likes" min="0" max="100"></v-range-slider>
							</v-card-text>
						</v-card>
						<v-expansion-panels>
							<v-expansion-panel></v-expansion-panel>
						</v-expansion-panels>
					</v-col>

					<v-col cols="12	">
						<v-card elevation="4" width="100%">
							<v-card-text>
								<v-subheader class="pa-0 h-init">Tags</v-subheader>
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
					</v-col>
				</v-row>
			</v-col>
			<v-col cols="12" sm="8">
				<v-card elevation="4" width="100%" height="100%">
					<v-container>
						<v-row>
							<v-col class="text-right">
								<v-btn-toggle mandatory v-model="mode" v-slot="{ active, toggle }">
									<v-btn :input-value="active" @click="toggle">
										<v-icon> mdi-image-multiple-outline </v-icon>
									</v-btn>
									<v-btn :input-value="active" @click="toggle">
										<v-icon> mdi-map-search-outline </v-icon>
									</v-btn>
								</v-btn-toggle>
							</v-col>
						</v-row>
					</v-container>
					<v-window v-model="mode">
						<v-window-item :value="1">
							<v-card-text> images </v-card-text>
						</v-window-item>

						<v-window-item :value="2">
							<v-card-text> map </v-card-text>
						</v-window-item>
					</v-window>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
	export default {
		auth: true,
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

<style scoped>
	.h-init {
		height: initial;
	}
</style>
