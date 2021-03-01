import axios from 'axios';

const apiClient = axios.create({
	baseURL: `${process.env.API}`,
	withCredentials: false,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
});

export default {
	getUser(id) {
		return apiClient.get('/user/' + id);
	},
};
