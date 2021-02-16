import express from 'express';
import authToken from '../../middleware/authToken';
import User from '../../models/User';

const searchRouter = express.Router();

const users = [
	{
		id: 1,
		username: 'user1',
		age: 21,
		url: 'https://i.pravatar.cc/300?img=1',
		likes: 1,
		location: {
			lat: 48.85,
			lng: 2.32,
		},
	},
	{
		id: 2,
		username: 'user2',
		age: 21,
		url: 'https://i.pravatar.cc/300?img=2',
		likes: 1,
		location: {
			lat: 48.86,
			lng: 2.26,
		},
	},
	{
		id: 3,
		username: 'user3',
		age: 21,
		likes: 1,
		url: 'https://i.pravatar.cc/300?img=3',
		location: {
			lat: 48.85,
			lng: 2.38,
		},
	},
	{
		id: 4,
		username: 'user4',
		age: 21,
		likes: 1,
		url: 'https://i.pravatar.cc/300?img=4',
		location: {
			lat: 48.65,
			lng: 2.35,
		},
	},
	{
		id: 5,
		username: 'user5',
		age: 21,
		likes: 1,
		url: 'https://i.pravatar.cc/300?img=5',
		location: {
			lat: 48.9,
			lng: 2.45,
		},
	},
	{
		id: 6,
		username: 'user6',
		age: 21,
		likes: 1,
		url: 'https://i.pravatar.cc/300?img=6',
		location: {
			lat: 48.85,
			lng: 2.34,
		},
	},
	{
		id: 7,
		username: 'user7',
		age: 21,
		likes: 1,
		url: 'https://i.pravatar.cc/300?img=7',
		location: {
			lat: 48.45,
			lng: 2.98,
		},
	},
];

// TODO : validate filter
searchRouter.get('/', authToken, async (req: any, res) => {
	try {
		const query: { age?: [string, string]; distance?: string; likes?: string } = req.query;
		if (!query || !query.age || !query.distance || !query.likes) throw 'Invalid query';
		const user = req.user;

		await User.searchedBy(
			req.user.id,
			query.age.map((s) => parseInt(s)),
			parseInt(query.distance),
			parseInt(query.likes)
		);
		return res.json({ users });
	} catch (error) {
		console.error(error);
		res.status(400);
	}
});

export default searchRouter;
