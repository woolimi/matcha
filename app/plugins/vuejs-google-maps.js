import Vue from 'vue';
import * as VueGoogleMaps from 'vue2-google-maps';

Vue.use(VueGoogleMaps, {
	load: {
		key: 'AIzaSyCjuAoT1JZlxEEEsOkYEXLTaiii9VJodAc',
		libraries: 'places', // necessary for places input
	},
});
