function is_verified_user(user: any): boolean {
	const { verified, languages, tags, preferences, gender, images, birthdate } = user;
	if (!verified || !languages.length || !tags.length || !preferences || !gender || !images[0].url || !birthdate)
		return false;
	return true;
}

export default function ({ route, redirect, $auth }: any) {
	if (!$auth.loggedIn) return;
	if (!is_verified_user($auth.user)) {
		return redirect('/app/profile');
	}
	if (route.path === '/app') return redirect('/app/search');
}
