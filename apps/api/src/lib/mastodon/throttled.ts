import { get, instanceKey, set } from '$lib/cache';
import fetch from 'node-fetch';
import semaphore from 'semaphore';

async function sleep(millis: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, millis);
	});
}

const semaphores = new Map<string, semaphore.Semaphore>();

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
export function throttledRequest<T extends object>(
	instanceURL: string,
	requestURL: string,
	auth?: string
): Promise<T | null> {
	const sem = semaphores.get(instanceURL) || semaphore(1);
	semaphores.set(instanceURL, sem);
	return new Promise<T | null>((resolve) => {
		sem.take(async () => {
			const now = new Date().getTime(); // current time in millis
			const latest: number = (await get(instanceKey(instanceURL))) || 0; // time of last request in millis
			const delay = Math.max(2000 - (now - latest), 0); // delay = 2 seconds - time since last request
			console.log(`Throttle delay: ${delay}`);
			if (delay > 0) {
				await sleep(delay);
			}
			console.log(`Sending request: ${requestURL} with auth: ${auth}`);
			try {
				const response = await fetch(requestURL, {
					headers: {
						...(auth ? { Authorization: auth } : {})
					},
					redirect: 'follow'
				});
				console.log(`Got response: ${response.status}`);
				if (response.status >= 400) {
					resolve(null);
				} else {
					const body = await response.json();
					resolve(body);
				}
			} catch (error) {
				console.error(error);
				resolve(null);
			} finally {
				await set(instanceKey(instanceURL), new Date().getTime());
				sem.leave();
			}
		});
	});
}
