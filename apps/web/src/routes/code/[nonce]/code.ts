import type { AuthCodeResponseBody } from 'types';

export async function handleCode(nonce: string) {
	console.log(`code: ${nonce}`);
	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get('code');
	const response = await fetch(`/api/v1/auth/code/${nonce}?code=${code}`);
	const body: AuthCodeResponseBody = await response.json();
	window.location.replace(body.result ? '/success' : '/failure');
}
