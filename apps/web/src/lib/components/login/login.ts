import type { LoginReponseBody, LoginRequestBody } from 'types';

export async function login(instanceURL: string) {
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
}
