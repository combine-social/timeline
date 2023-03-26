import { login as getClient } from 'masto';
import type { LoginReponseBody, LoginRequestBody } from 'types';

async function verifiedInstanceName(instance: string): Promise<string | null> {
	try {
		const url = new URL(instance.startsWith('http') ? instance : `https://${instance}`);
		const hostname = url.hostname;
		const client = await getClient({
			url: url.toString(),
			disableDeprecatedWarning: true,
			disableVersionCheck: true
		});
		const response = await client.v2.instance.fetch();
		return response.domain === hostname ? hostname : null;
	} catch (error) {
		console.error(error);
		return null;
	}
}

export async function loginOrReturnError(instance: string): Promise<string | null> {
	const instanceURL = await verifiedInstanceName(instance);
	if (!instanceURL) return `${instance} is not a valid mastodon instance`;
	const body: LoginRequestBody = {
		instanceURL
	};
	const response = await fetch('/api/v1/auth/login', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		redirect: 'manual',
		body: JSON.stringify(body)
	});
	const result: LoginReponseBody = await response.json();
	document.location.href = result.authURL;
	return null;
}
