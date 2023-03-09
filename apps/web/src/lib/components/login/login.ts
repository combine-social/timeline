import { getAuthorizationURL, registerApplication } from '$lib/services/mastodon';

export async function login(instanceURL: string) {
	await fetch('/api/v1/login', {
		body: JSON.stringify({
			instanceURL
		})
	});
}
