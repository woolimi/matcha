import { Context } from '@nuxt/types';

export default function ({ route, redirect }: Context) {
	if (route.path === '/app') {
		return redirect('/app/search');
	}
}
