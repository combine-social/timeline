import type { LoginReponseBody, LoginRequestBody } from 'types';

export async function login(instanceURL: string) {
	const body: LoginRequestBody = {
		instanceURL
	};
	console.log(`posting ${JSON.stringify(body)}`);
	const response = await fetch('/api/v1/auth/login', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		redirect: 'manual',
		body: JSON.stringify(body)
	});
	console.log(`reponse: ${JSON.stringify(response)}`);
	const result: LoginReponseBody = await response.json();
	window.open(result.authURL);
}
