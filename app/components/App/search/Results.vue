<template>
	<v-container>
		<v-row>
			<template v-if="$store.state.search.mode === 'image'">
				<v-col v-for="user in users" :key="user.id" :cols="imageCols">
					<NuxtLink :to="{ path: `/app/profile/users/${user.id}` }" custom v-slot="{ navigate }">
						<v-card @click="navigate" role="link" elevation="10" style="border-radius: 15px">
							<v-img :src="user.url" width="100%" height="100%" aspect-ratio="0.75">
								<v-container class="d-flex align-start flex-column" style="height: 100%">
									<v-spacer></v-spacer>
									<div class="font-weight-black white--text text-shadow">
										{{ user.username }}, {{ user.age }}
									</div>
									<div class="font-weight-black white--text">
										<v-icon color="primary">mdi-heart</v-icon>
										<span class="text-shadow">{{ user.likes }}</span>
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
						:to="{ path: `/app/profile/users/${user.id}` }"
						custom
						v-slot="{ navigate }"
					>
						<gmap-custom-marker :marker="user.location" :data-user-id="user.id" @click.native="navigate">
							<v-avatar color="primary" size="50">
								<v-img :src="user.url" class="marker-avatar" />
							</v-avatar>
						</gmap-custom-marker>
					</NuxtLink>
				</gmap-map>
			</template>
		</v-row>
	</v-container>
</template>

<script>
	export default {
		data() {
			return {
				center: this.$auth.user.location,
			};
		},
		mounted() {
			this.$store.dispatch('search/updateUsers', {});
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
</style>
