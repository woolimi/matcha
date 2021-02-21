<template>
	<v-footer color="primary" padless v-bind:style="{ 'z-index': 10 }">
		<v-row justify="center" no-gutters>
			<v-col class="primary py-4 text-center white--text" cols="12">
				{{ new Date().getFullYear() }} — <strong>Matcha</strong> —
				<v-btn class="mx-2" fab dark small text @click="toggleDarkMode">
					<v-icon dark>mdi-brightness-6</v-icon>
				</v-btn>
			</v-col>
		</v-row>
	</v-footer>
</template>

<script>
	export default {
		methods: {
			toggleDarkMode() {
				this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
				localStorage.setItem('dark_theme', this.$vuetify.theme.dark.toString());
			},
		},
		mounted() {
			// Load Dark Theme
			const theme = localStorage.getItem('dark_theme');
			if (theme) {
				this.$vuetify.theme.dark = theme === 'true';
			} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
				this.$vuetify.theme.dark = true;
				localStorage.setItem('dark_theme', this.$vuetify.theme.dark.toString());
			}
		},
	};
</script>
