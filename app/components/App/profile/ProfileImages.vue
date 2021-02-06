<template>
	<v-card elevation="4" height="450" class="pa-2">
		<v-row>
			<v-col class="text-center">
				<v-window v-model="window">
					<v-window-item v-for="(image, i) in $auth.user.images" :key="i">
						<div class="d-flex justify-center">
							<v-overlay :absolute="true" v-if="saving" color="transparent">
								<v-progress-circular indeterminate color="primary"> </v-progress-circular>
							</v-overlay>

							<ImageUploader v-model="$auth.user.images[i]" :imageId="i">
								<div slot="activator">
									<v-avatar
										tile
										height="350"
										width="100%"
										max-width="250"
										class="elevation-10 grey lighten-3 pointer"
									>
										<p v-if="!$auth.user.images[i].url">Click here to add photo</p>
										<img v-else :src="$auth.user.images[i].url" alt="profile photo" />
										<v-btn
											style="position: absolute; z-index: 1; right: 5%; bottom: 5%"
											fab
											x-small
											color="error"
											@click.stop="deleteImage"
											v-if="$auth.user.images[i].url"
										>
											<v-icon> mdi-minus </v-icon>
										</v-btn>
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
						<v-btn :input-value="active" icon @click="toggle" :color="i === 0 ? 'primary' : 'warning'">
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
		}),
		methods: {
			deleteImage() {
				console.log('deleteImage');
			},
		},
	};
</script>

<style scoped>
	.pointer {
		cursor: pointer;
	}
</style>
