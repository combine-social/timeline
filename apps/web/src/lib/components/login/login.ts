import type { LoginReponseBody, LoginRequestBody, VerifyResponseBody } from 'types';

interface InstanceVerification {
	instanceURL: string;
	verified: boolean;
	status: string;
}

async function verifiedInstance(instance: string): Promise<InstanceVerification> {
	try {
		const url = new URL(instance.startsWith('http') ? instance : `https://${instance}`);
		const hostname = url.hostname;
		const response = await fetch(`/api/v1/verify?host=${hostname}`);
		const result: VerifyResponseBody = await response.json();
		return {
			instanceURL: hostname,
			verified: result.verified,
			status: result.text,
		}
	} catch (error) {
		console.error(error);
		return {
			instanceURL: instance,
			verified: false,
			status: `Failed to connect to ${instance}`,
		};
	}
}

export async function loginOrReturnError(instance: string): Promise<string | null> {
	if (!instance) return 'enter a mastodon instance name';
	const verification = await verifiedInstance(instance);
	if (!verification.verified) return verification.status;
	const body: LoginRequestBody = {
		instanceURL: verification.instanceURL,
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
