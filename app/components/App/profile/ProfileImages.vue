<template>
	<v-card elevation="4" height="450" class="pa-2">
		<v-row>
			<v-col class="text-center">
				<v-window v-model="window">
					<v-window-item v-for="(image, i) in $auth.user.images" :key="i">
						<div class="d-flex justify-center">
							<v-overlay :absolute="true" v-if="imageLoading" color="transparent">
								<v-progress-circular indeterminate color="primary"> </v-progress-circular>
							</v-overlay>

							<ImageUploader v-model="imageLoading" :imageId="i" ref="images">
								<div slot="activator">
									<v-avatar
										tile
										height="350"
										width="100%"
										max-width="300"
										class="elevation-10 grey lighten-3 pointer"
									>
										<p v-if="!$auth.user.images[i].url" class="black--text">
											Click here to add photo
										</p>
										<img v-else :src="$auth.user.images[i].url" alt="profile photo" />

										<v-btn
											style="position: absolute; z-index: 1; right: 5%; bottom: 5%"
											fab
											x-small
											color="error"
											@click.stop="deleteImage"
											v-if="$auth.user.images[i].url"
										>
											<v-icon> mdi-delete </v-icon>
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
				<v-item-group v-model="window" mandatory>
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
			refs: new Array(5).fill(null),
		}),
		computed: {
			imageLoading: {
				get() {
					return this.saving;
				},
				set(val) {
					this.saving = val;
				},
			},
		},
		methods: {
			async deleteImage() {
				const input_ref = this.$refs.images[this.window].$refs.file;
				input_ref.value = null;

				try {
					this.saving = true;
					await this.$axios.post(`/api/profile/images/${this.$auth.user.id}/${this.window}`, {
						path: this.$auth.user.images[this.window].path,
					});
					const images = this.$auth.user.images;
					images[this.window] = { url: '', path: '' };
					this.$auth.setUser({ ...this.$auth.user, images });
					this.$notifier.showMessage({
						message: `Deleted`,
						color: 'success',
					});
				} catch (error) {
					this.$notifier.showMessage({
						message: `Fail to delete`,
						color: 'error',
					});
					console.error(error);
				}
				this.saving = false;
			},
		},
	};
</script>

<style scoped>
	.pointer {
		cursor: pointer;
	}
</style>
