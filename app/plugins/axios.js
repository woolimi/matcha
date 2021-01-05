export default function ({ $axios, app }) {
	$axios.onResponseError((err) => {
		// const code = parseInt(err.response.status);
		// let originalRequest = err.config;
		// console.log("status code", code);
	});
}
