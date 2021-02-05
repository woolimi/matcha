import { LocationXY, LocationLL } from '../init/Interfaces';

export function xy2ll(xy: LocationXY) {
	return {
		lat: xy.y,
		lng: xy.x,
	};
}

export function ll2xy(ll: LocationLL) {
	return {
		x: ll.lng,
		y: ll.lat,
	};
}
