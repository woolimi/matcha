<template>
	<v-card style="position: relative; height: 100%">
		<v-card-title style="font-size: 0.8em">
			<h4 style="z-index: 1">{{ title }}</h4>
			<v-icon x-large color="grey lighten-1" style="position: absolute; right: 0.1em">
				mdi-format-quote-close
			</v-icon>
		</v-card-title>
		<v-card-text>{{ content }}</v-card-text>
	</v-card>
</template>

<script>
	export default {
		props: ['title', 'content'],
	};
</script>

<style scoped></style>
