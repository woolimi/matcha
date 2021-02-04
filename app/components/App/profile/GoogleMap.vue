<template>
	<v-container>
		<v-container>
			<label>
				<gmap-autocomplete @place_changed="setPlace" class="text-field"> </gmap-autocomplete>
				<v-btn @click="setLocationBySearch" class="primary">Set Location</v-btn>
			</label>
		</v-container>
		<gmap-map :center="center" @click="setLocation" :zoom="12" style="width: 100%; height: 50vh">
			<gmap-marker :position="location"></gmap-marker>
		</gmap-map>
	</v-container>
</template>

<script>
	export default {
		name: 'GoogleMap',
		data() {
			return {
				center: {
					lat: this.$auth.user.location.x,
					lng: this.$auth.user.location.y,
				},
				place: null,
			};
		},

		computed: {
			location() {
				return {
					lat: this.$auth.user.location.x,
					lng: this.$auth.user.location.y,
				};
			},
		},

		methods: {
			setPlace(place) {
				this.place = place;
				const loc = this.place.geometry.location;
				this.center = {
					lat: loc.lat(),
					lng: loc.lng(),
				};
			},
			setLocationBySearch() {
				console.log(this.place);
				this.setLocation({ latLng: this.place.geometry.location });
			},
			async setLocation({ latLng }) {
				try {
					await this.$axios.post('/api/profile/location', [latLng.lat(), latLng.lng()]);
					this.$auth.setUser({
						...this.$auth.user,
						location: {
							x: latLng.lat(),
							y: latLng.lng(),
						},
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
