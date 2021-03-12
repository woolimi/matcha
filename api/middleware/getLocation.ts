import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import geoip from 'geoip-lite';

const getLocation = (req: Request, res: Response, next: NextFunction) => {
	const uinfo = req.body;
	const clientIp = req.clientIp;
	const default_location = { lat: 48.8566, lng: 2.3522 };
	// Find location by IP if browser gps diabled
	if (!_.isEmpty(uinfo.location)) return next();
	if (!clientIp) return default_location;

	const found_ll = geoip.lookup(clientIp)?.ll;
	uinfo.location = found_ll ? { lat: found_ll[0], lng: found_ll[1] } : default_location;

	return next();
};

export default getLocation;
