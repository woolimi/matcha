import { Context } from '@nuxt/types';

export default function ({ route, redirect }: Context) {
	// If the user is not authenticated
	if (route.path === '/app') {
		return redirect('/app/search');
	}
}
