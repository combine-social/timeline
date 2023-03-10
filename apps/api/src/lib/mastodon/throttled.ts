import { get, instanceKey, set } from '$lib/cache';
import fetch from 'node-fetch';

async function sleep(millis: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, millis);
	});
}

/*
	Request a resource from an instance.

	To ensure that rate limits are not hit - and to leave some
	space left over in the rate limit to the actual user,
	request rates are throttled to one request to a given instance
	every other seconds.

	Rate limits are set to 300 requests per 5 minutes, meaning
	maximum one request per second (per ip and per user).
	Setting this to one request every other second leaves plenty 
	of room left for the human user to make requests.
*/
export async function throttledRequest<T extends object>(
	instanceURL: string,
	requestURL: string,
	auth?: string
): Promise<T | null> {
	const now = new Date().getTime(); // current time in millis
	const latest: number = (await get(instanceKey(instanceURL))) || 0; // time of last request in millis
	const delay = Math.max(2000 - (now - latest), 0); // delay = 2 seconds - time since last request
	if (delay > 0) {
		await sleep(delay);
	}
	const response = await fetch(requestURL, {
		headers: {
			...(auth ? { Authorization: auth } : {})
		},
		redirect: 'follow'
	});
	if (response.status >= 400) return null;
	await set(instanceKey(instanceURL), new Date().getTime());
	return await response.json();
}
