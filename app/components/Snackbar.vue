<template>
	<v-snackbar v-model="show" :color="snackbar.color" timeout="4000">
		{{ snackbar.message }}
		<template v-slot:action="{ attrs }">
			<v-btn dark text v-bind="attrs" @click="close"> Close </v-btn>
		</template>
	</v-snackbar>
</template>

<script>
	import { mapState } from 'vuex';

	export default {
		methods: {
			close() {
				this.$store.commit('snackbar/CLOSE');
			},
		},
		computed: {
			show: {
				get() {
					return this.$store.state.snackbar.show;
				},
				set(val) {
					this.$store.commit('snackbar/SET', val);
				},
			},
			...mapState(['snackbar']),
		},
	};
</script>
