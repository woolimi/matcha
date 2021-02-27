<template>
	<v-container>
		<v-row class="images-scroll" v-scroll.self="scroll">
			<v-overlay :value="overlay" color="transparent"> </v-overlay>

			<template v-if="mode === 'image'">
				<v-col v-for="user in users" :key="user.id" :cols="imageCols">
					<NuxtLink :to="{ path: `/app/users/${user.id}` }" custom v-slot="{ navigate }">
						<v-card @click="navigate" role="link" elevation="10" style="border-radius: 15px">
							<v-img :src="user.image" width="100%" height="100%" aspect-ratio="0.75">
								<v-container class="d-flex align-end" style="height: 100%">
									<div class="d-block" style="width: 100%">
										<div class="font-weight-black white--text text-shadow">
											{{ user.username }}, {{ user.age }}
										</div>
										<div class="white--text font-weight-black d-flex justify-space-between">
											<div class="d-block">
												<v-icon color="amber">mdi-crown</v-icon>
												{{ user.fame }}
											</div>
											<div class="text-shadow">{{ user.distance }}km</div>
										</div>
									</div>
								</v-container>
							</v-img>
						</v-card>
					</NuxtLink>
				</v-col>
			</template>
			<template v-else>
				<gmap-map
					:options="{
						mapTypeControl: false,
						streetViewControl: false,
						rotateControl: false,
						fullscreenControl: false,
					}"
					:center="center"
					:zoom="12"
					style="width: 100%; height: 65vh"
				>
					<NuxtLink
						v-for="user in users"
						:key="user.id"
						:to="{ path: `/app/users/${user.id}` }"
						custom
						v-slot="{ navigate }"
					>
						<div>
							<gmap-custom-marker
								:marker="user.location"
								:data-user-id="user.id"
								@click.native="navigate"
							>
								<v-avatar color="primary" size="50">
									<v-img :src="user.image" class="marker-avatar" />
								</v-avatar>
							</gmap-custom-marker>
						</div>
					</NuxtLink>
					<gmap-marker :position="center"> </gmap-marker>
				</gmap-map>
			</template>
		</v-row>
	</v-container>
</template>

<script>
	export default {
		beforeCreate() {
			this.$store.dispatch('search/initTags', this.$auth.user.tags);
		},
		mounted() {
			this.$store.dispatch('search/updateResult');
		},
		computed: {
			imageCols() {
				const bp = this.$vuetify.breakpoint;
				if (bp.xsOnly) return 6;
				if (bp.smAndUp) return 4;
			},
			users() {
				return this.$store.state.search.users;
			},
			center() {
				return this.$auth.user.location;
			},
			mode() {
				return this.$store.state.search.mode;
			},
			sort() {
				return [this.$store.state.search.sort, this.$store.state.search.sort_dir];
			},
		},
		methods: {
			async scroll(e) {
				if (this.overlay) return;
				if (Math.floor(e.target.scrollHeight - e.target.scrollTop) <= e.target.clientHeight + 50) {
					this.overlay = true;
					await this.$store.dispatch('search/updateResult', true);
					this.overlay = false;
				}
			},
		},
		data() {
			return {
				overlay: false,
			};
		},
	};
</script>

<style scoped>
	.user-info {
		position: relative;
		left: 1em;
		bottom: 1em;
	}
	.text-shadow {
		text-shadow: 1px 1px 6px black;
	}
	.marker-avatar {
		border: 3px solid grey;
		cursor: pointer;
	}

	.images-scroll {
		overflow-y: auto;
		height: calc(100vh - 220px);
	}

	@media screen and (max-width: 960px) {
		.images-scroll {
			height: calc(100vh - 320px);
		}
	}
</style>
