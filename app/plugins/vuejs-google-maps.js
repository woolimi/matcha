import Vue from 'vue';
import * as VueGoogleMaps from 'vue2-google-maps';

Vue.use(VueGoogleMaps, {
	load: {
		key: process.env.GMAP_KEY,
		libraries: 'places', // necessary for places input
	},
});
