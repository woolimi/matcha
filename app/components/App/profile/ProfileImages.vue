<template>
	<v-card elevation="4" height="450" class="pa-2">
		<v-row>
			<v-col class="text-center">
				<v-window v-model="window">
					<v-window-item v-for="(image, i) in $auth.user.images" :key="i">
						<div class="d-flex justify-center">
							<ImageUploader v-model="$auth.user.images[i]" :imageId="i">
								<div slot="activator">
									<v-avatar
										tile
										height="350"
										width="100%"
										max-width="250"
										class="mb-1 elevation-3 grey lighten-3 pointer"
									>
										<v-overlay :absolute="true" v-if="saving">
											<v-progress-circular indeterminate color="primary"> </v-progress-circular>
										</v-overlay>
										<v-icon size="35px" v-if="!$auth.user.images[i].url"
											>mdi-plus-circle-outline</v-icon
										>
										<img v-else :src="$auth.user.images[i].url" alt="profile photo" />
									</v-avatar>
								</div>
							</ImageUploader>
						</div>
					</v-window-item>
				</v-window>
			</v-col>
		</v-row>
		<v-row>
			<v-col class="text-center">
				<v-item-group v-model="window" class="" mandatory tag="v-flex">
					<v-item v-for="(n, i) in $auth.user.images" :key="i" v-slot="{ active, toggle }">
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
