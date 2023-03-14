import type { LoginRequestBody } from 'types';

export async function login(instanceURL: string) {
	const body: LoginRequestBody = {
		instanceURL
	};
	await fetch('http://localhost:3000/api/v1/login', {
		method: 'POST',
		body: JSON.stringify(body)
	});
}
