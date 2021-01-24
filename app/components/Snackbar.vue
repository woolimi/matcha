<template>
	<v-snackbar v-model="show" :multi-line="multiline" :timeout="timeout" :color="color">
		{{ text }}

		<template v-slot:action="{ attrs }">
			<v-btn dark text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
		</template>
	</v-snackbar>
</template>

<script>
	export default {
		created() {
			this.$store.subscribe((mutation, state) => {
				if (mutation.type === 'snackbar/show') {
					this.text = state.snackbar.text;
					this.color = state.snackbar.color;
					this.timeout = state.snackbar.timeout;
					this.show = true;
				}
			});
		},
		data() {
			return {
				show: false,
				color: 'success',
				multiline: true,
				text: '',
				timeout: 4000,
			};
		},
	};
</script>
