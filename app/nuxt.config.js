export default {
	server: {
		host: '0',
		port: process.env.PORT || 3000,
	},
	// Global page headers (https://go.nuxtjs.dev/config-head)
	head: {
		titleTemplate: '%s',
		title: 'Matcha',
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ hid: 'description', name: 'description', content: '' },
		],
		link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
	},

	// Global CSS (https://go.nuxtjs.dev/config-css)
	css: ['~/assets/css/matcha.css'],

	// Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
	plugins: [
		'~/plugins/notifier.client',
		'~/plugins/validator.client.ts',
		{ src: '~/plugins/vuejs-google-maps.js', mode: 'client' },
		'~/plugins/date.ts',
		{ src: '~/plugins/google-maps-marker.js', mode: 'client' },
		{ src: '~/plugins/client-oauth2.js', mode: 'client' },
	],

	// Auto import components (https://go.nuxtjs.dev/config-components)
	components: true,

	// Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
	buildModules: [
		// https://go.nuxtjs.dev/typescript
		'@nuxt/typescript-build',
		// https://go.nuxtjs.dev/vuetify
		'@nuxtjs/vuetify',
		'@nuxtjs/dotenv',
	],

	// Modules (https://go.nuxtjs.dev/config-modules)
	modules: [
		// https://go.nuxtjs.dev/axios
		'@nuxtjs/axios',
		'@nuxtjs/auth-next',
		['cookie-universal-nuxt', { parseJSON: false }],
		'nuxt-socket-io',
	],

	router: {
		middleware: ['auth'],
	},
	auth: {
		strategies: {
			cookie: {
				scheme: 'refresh',
				token: {
					property: 'access_token',
					type: 'Bearer',
					maxAge: 60 * 15,
				},
				refreshToken: {
					property: 'refresh_token',
					data: 'refresh_token',
					maxAge: 3600 * 24 * 7,
				},
				user: {
					property: 'user',
					autoFetch: true,
				},
				endpoints: {
					login: { url: '/auth/login', method: 'post' },
					logout: { url: '/auth/logout', method: 'delete' },
					user: { url: '/auth/me', method: 'get' },
					refresh: { url: '/auth/refresh', method: 'post' },
				},
				secure: process.env.ENVIRONMENT === 'prod' ? true : false,
			},
		},
		localStorage: false,
		redirect: {
			login: '/',
			logout: '/',
			home: '/app',
		},
	},

	// Axios module configuration (https://go.nuxtjs.dev/config-axios)
	axios: {
		baseURL: process.env.API || 'http://localhost:5000',
		credentials: true,
		debug: process.env.ENVIRONMENT === 'prod' ? false : true,
	},

	// Vuetify module configuration (https://go.nuxtjs.dev/config-vuetify)
	vuetify: {
		customVariables: ['~/assets/variables.scss'],
		theme: {
			dark: false,
			themes: {
				dark: {
					primary: '#9e0000',
				},
				light: {
					primary: '#9e0000',
				},
			},
		},
	},

	// Build Configuration (https://go.nuxtjs.dev/config-build)
	build: {
		transpile: [/^vue2-google-maps($|\/)/, /^vue2-gmap-custom-marker($|\/)/],
		extend: function (config, { isDev, isClient }) {
			config.node = {
				fs: 'empty',
			};
		},
	},

	io: {
		sockets: [
			{
				url: process.env.API || 'http://localhost:5000',
				default: true,
				// https://nuxt-socket-io.netlify.app/configuration/#vuex-options-per-socket
				vuex: {
					mutations: ['chat/receiveMessage', 'chat/addToList'],
					actions: [
						'chat/messageError',
						'notifications/receive',
						'notifications/setListAsRead',
						'blockedBy --> notifications/blockedBy',
						'unblockedBy --> notifications/unblockedBy',
						'userLogin --> notifications/userLogin',
						'userLogout --> notifications/userLogout',
					],
				},
			},
		],
	},
};
