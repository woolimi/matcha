<template>
	<v-container>
		<v-row>
			<v-col cols="12">
				<h1 v-if="error.statusCode === 404" class="text-center">
					{{ pageNotFound }}
				</h1>
				<h1 v-else>
					{{ otherError }}
				</h1>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
	export default {
		layout: 'empty',
		props: {
			error: {
				type: Object,
				default: null,
			},
		},
		data() {
			return {
				pageNotFound: '404 Not Found',
				otherError: 'An error occurred',
			};
		},
		head() {
			const title = this.error.statusCode === 404 ? this.pageNotFound : this.otherError;
			return {
				title,
			};
		},
	};
</script>

<style scoped>
	h1 {
		font-size: 20px;
	}
</style>
