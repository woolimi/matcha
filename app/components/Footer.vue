<template>
	<v-footer color="primary" padless v-bind:style="{ 'z-index': 10 }">
		<v-row justify="center" no-gutters>
			<v-col class="primary py-4 text-center white--text" cols="12">
				{{ new Date().getFullYear() }} — <strong>Matcha</strong>
			</v-col>
		</v-row>
	</v-footer>
</template>
