function is_verified_user(user: any): boolean {
	const { verified, languages, tags, preferences, gender, images } = user;
	if (!verified || !languages.length || !tags.length || !preferences || !gender || !images[0].url) return false;
	return true;
}

export default function ({ route, redirect, $auth }: any) {
	if (!$auth.user) return;
	if (route.path === '/app') return redirect('/app/search');
	if (route.path !== '/app/profile' && !is_verified_user($auth.user)) {
		return redirect('/app/profile');
	}
}
