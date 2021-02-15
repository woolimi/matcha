<template>
	<v-container>
		<v-container>
			<label>
				<gmap-autocomplete @place_changed="setPlace" class="text-field"> </gmap-autocomplete>
				<v-btn @click="setLocationBySearch" class="primary">Set Location</v-btn>
			</label>
		</v-container>
		<gmap-map
			:options="{
				mapTypeControl: false,
				streetViewControl: false,
				rotateControl: false,
				fullscreenControl: false,
			}"
			:center="center"
			@click="setLocation"
			:zoom="12"
			style="width: 100%; height: 50vh"
		>
			<gmap-marker :position="location"></gmap-marker>
		</gmap-map>
	</v-container>
</template>

<script>
	export default {
		name: 'GoogleMap',
		data() {
			return {
				center: this.$auth.user.location,
				place: null,
			};
		},

		computed: {
			location: {
				get() {
					return this.$auth.user.location;
				},
				set() {},
			},
		},

		methods: {
			setPlace(place) {
				this.place = place;
				if (!this.place.geometry) return;
				const loc = this.place.geometry.location;
				this.center = {
					lat: loc.lat(),
					lng: loc.lng(),
				};
			},
			setLocationBySearch() {
				if (!this.place || !this.place.geometry) return;
				this.setLocation({ latLng: this.place.geometry.location });
			},
			async setLocation({ latLng }) {
				try {
					const location = { lat: latLng.lat(), lng: latLng.lng() };
					await this.$axios.post('/api/profile/location', location);
					this.$auth.setUser({
						...this.$auth.user,
						location,
					});
					this.$notifier.showMessage({
						message: 'Location changed',
						color: 'success',
					});
				} catch (error) {
					this.$notifier.showMessage({
						message: 'Location error',
						color: 'error',
					});
				}
			},
		},
	};
</script>

<style scoped>
	.text-field {
		border: 2px solid black;
		border-radius: 10px;
		padding: 5px;
	}
</style>
