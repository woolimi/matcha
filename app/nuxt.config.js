import colors from 'vuetify/es5/util/colors';

export default {
	server: {
		host: '0',
		port: 3000,
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
		'~/plugins/date.client.ts',
	],

	// Auto import components (https://go.nuxtjs.dev/config-components)
	components: true,

	// Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
	buildModules: [
		// https://go.nuxtjs.dev/typescript
		'@nuxt/typescript-build',
		// https://go.nuxtjs.dev/vuetify
		'@nuxtjs/vuetify',
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
			},
		},
		localStorage: false,
		redirect: {
			login: '/',
			logout: '/',
			callback: '/',
			home: '/app',
		},
	},

	// Axios module configuration (https://go.nuxtjs.dev/config-axios)
	axios: {
		// baseURL: 'http://176.169.89.89:5000',
		baseURL: 'http://localhost:5000',
		credentials: true,
		debug: true,
	},

	// Vuetify module configuration (https://go.nuxtjs.dev/config-vuetify)
	vuetify: {
		customVariables: ['~/assets/variables.scss'],
		theme: {
			dark: false,
			themes: {
				dark: {
					primary: colors.blue.darken2,
					accent: colors.grey.darken3,
					secondary: colors.amber.darken3,
					info: colors.teal.lighten1,
					warning: colors.amber.base,
					error: colors.deepOrange.accent4,
					success: colors.green.accent3,
				},
				light: {
					primary: '#9e0000',
				},
			},
		},
	},

	// Build Configuration (https://go.nuxtjs.dev/config-build)
	build: {
		extend: function (config, { isDev, isClient }) {
			config.node = {
				fs: 'empty',
			};
		},
	},

	io: {
		sockets: [
			{
				url: 'http://localhost:5000',
				default: true,
				// https://nuxt-socket-io.netlify.app/configuration/#vuex-options-per-socket
				vuex: {
					mutations: [
						'chat/receiveMessage',
						'userLogin --> chat/userLogin',
						'userLogout --> chat/userLogout',
						'notification --> notifications/receive',
					],
					actions: ['chat/messageError'],
				},
			},
		],
	},
};
