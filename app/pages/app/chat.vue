<template>
	<v-row no-gutters style="height: 100%">
		<ChatList />
		<NuxtChild />
	</v-row>
</template>

<script>
	export default {
		auth: true,
		middleware: 'checkVerfiedUser',
	};
</script>
