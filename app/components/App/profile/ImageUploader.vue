<template>
	<div style="height: 350px; width: 100%; max-width: 300px">
		<div @click="launchFilePicker()">
			<slot name="activator"> </slot>
		</div>
		<input
			type="file"
			enctype="multipart/form-data"
			ref="file"
			name="image"
			@change="onFileChange($event.target.name, $event.target.files)"
			style="display: none"
		/>
	</div>
</template>

<script>
	export default {
		props: {
			value: Boolean,
			imageId: Number,
		},
		methods: {
			launchFilePicker() {
				this.$refs.file.click();
			},
			async onFileChange(fieldName, file) {
				try {
					if (!file.length) return;

					this.$emit('input', true);
					const maxSize = 3;
					const imageFile = file[0];
					let size = imageFile.size / 1024 / 1024;

					if (!imageFile.type.match('image.*'))
						return this.$notifier.showMessage({
							message: `Please choose an image file`,
							color: 'error',
						});

					if (size > maxSize)
						return this.$notifier.showMessage({
							message: `Your file is too big! Please select an image under ${maxSize}MB`,
							color: 'error',
						});

					let formData = new FormData();
					formData.append(fieldName, imageFile);
					const { data } = await this.$axios.put(
						`/api/profile/images/${this.$auth.user.id}/${this.imageId}`,
						formData,
						{
							headers: {
								'content-type': 'multipart/form-data',
							},
						}
					);

					if (data.error) throw { error: data.error };

					this.$auth.setUser({
						...this.$auth.user,
						images: data.images,
					});
					this.$notifier.showMessage({
						message: 'Image uploaded',
						color: 'success',
					});
					this.$emit('input', false);
				} catch (e) {
					if (e.error) {
						this.$notifier.showMessage({
							message: e.error,
							color: 'error',
						});
					} else console.error(e);
					this.$emit('input', false);
				}
			},
		},
	};
</script>
<style scoped></style>
