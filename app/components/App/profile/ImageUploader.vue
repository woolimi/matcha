<template>
	<div style="height: 350px; width: 100%; max-width: 250px">
		<!-- slot for parent component to activate the file changer -->
		<div @click="launchFilePicker()">
			<slot name="activator"> </slot>
		</div>
		<!-- image input: style is set to hidden and assigned a ref so that it can be triggered -->
		<input
			type="file"
			enctype="multipart/form-data"
			ref="file"
			:name="uploadFieldName"
			@change="onFileChange($event.target.name, $event.target.files)"
			style="display: none"
		/>
	</div>
</template>

<script>
	export default {
		data: () => ({
			uploadFieldName: 'file',
		}),
		props: {
			// Use "value" to enable using v-model
			value: Object,
		},
		methods: {
			launchFilePicker() {
				this.$refs.file.click();
			},
			onFileChange(fieldName, file) {
				const maxSize = 3;
				const imageFile = file[0];
				if (file.length > 0) {
					let size = imageFile.size / 1024 / 1024;
					if (!imageFile.type.match('image.*')) {
						// check whether the upload is an image
						this.$notifier.showMessage({
							message: `Please choose an image file`,
							color: 'error',
						});
					} else if (size > maxSize) {
						// check whether the size is greater than the size limit
						this.$notifier.showMessage({
							message: `Your file is too big! Please select an image under ${maxSize}MB`,
							color: 'error',
						});
					} else {
						// Append file into FormData and turn file into image URL
						let formData = new FormData();
						const url = URL.createObjectURL(imageFile);
						formData.append(fieldName, imageFile);
						// Emit the FormData and image URL to the parent component
						this.$emit('input', { formData, url });
					}
				}
			},
		},
	};
</script>
<style scoped></style>
