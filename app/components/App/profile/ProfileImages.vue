<template>
	<v-card elevation="4" height="450" class="pa-2">
		<v-row>
			<v-col class="text-center">
				<v-window v-model="window">
					<v-window-item v-for="(image, i) in user.images" :key="i">
						<ImageUploader v-model="user.images[i]">
							<div slot="activator">
								<v-avatar
									tile
									height="350"
									width="100%"
									max-width="250"
									v-if="!user.images[i].url"
									class="mb-2 elevation-3 grey lighten-3 pointer"
								>
									<!-- <v-overlay :absolute="true" z-index="10"> -->
									<!-- <v-progress-circular indeterminate color="primary" v-if="saving"> -->
									<!-- </v-progress-circular> -->
									<v-icon size="35px">mdi-plus-circle-outline</v-icon>
									<!-- </v-overlay> -->
								</v-avatar>
								<v-avatar tile height="300" width="100%" max-width="250" v-else class="pointer">
									<img :src="user.images[i].url" alt="profile photo" />
								</v-avatar>
							</div>
						</ImageUploader>
					</v-window-item>
				</v-window>
			</v-col>
		</v-row>
		<v-row>
			<v-col class="text-center">
				<v-item-group v-model="window" class="" mandatory tag="v-flex">
					<v-item v-for="(n, i) in user.images" :key="i" v-slot="{ active, toggle }">
						<v-btn :input-value="active" icon @click="toggle">
							<v-icon>mdi-record</v-icon>
						</v-btn>
					</v-item>
				</v-item-group>
			</v-col>
		</v-row>
	</v-card>
</template>

<script>
	export default {
		data: () => ({
			user: {
				images: [{}, {}, {}, {}, {}],
			},
			window: 0,
			saving: false,
			saved: true,
		}),
		methods: {
			uploadImage() {
				this.saving = true;
				setTimeout(() => this.savedAvatar(), 1000);
			},
			savedAvatar() {
				this.saving = false;
				this.saved = true;
			},
		},
		watch: {
			user: {
				handler: function () {
					this.saved = false;
				},
				deep: true,
			},
		},
	};
</script>

<style scoped>
	.pointer {
		cursor: pointer;
	}
</style>
