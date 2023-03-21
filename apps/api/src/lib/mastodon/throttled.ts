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

	This uses throttled() to ensure that rate limits are adhered to
*/
export function throttledRequest<T extends object>(
	instanceURL: string,
	requestURL: string,
	auth?: string
): Promise<T | null> {
	return throttled(instanceURL, async () => {
		const response = await fetch(requestURL, {
			headers: {
				...(auth ? { Authorization: auth } : {})
			},
			redirect: 'follow'
		});
		console.log(`Got response: ${response.status}`);
		if (response.status >= 400) {
			return null;
		} else {
			return await response.json();
		}
	});
}

/*
	Perform a task at an instance.

	To ensure that rate limits are not hit - and to leave some
	space left over in the rate limit to the actual user,
	request rates are throttled to one request to a given instance
	every other seconds.

	Rate limits are set to 300 requests per 5 minutes, meaning
	maximum one request per second (per ip and per user).
	Setting this to one request every other second leaves plenty 
	of room left for the human user to make requests.
*/
export function throttled<T extends object>(
	instanceURL: string,
	callback: () => Promise<T | null>,
	requestsPerMinute = 30
): Promise<T | null> {
	const delay = 60_000 / requestsPerMinute;
	const sem = semaphores.get(instanceURL) || semaphore(1);
	semaphores.set(instanceURL, sem);
	return new Promise<T | null>((resolve) => {
		sem.take(async () => {
			const now = new Date().getTime(); // current time in millis
			const latest: number = (await get(instanceKey(instanceURL))) || 0; // time of last request in millis
			const waitTime = Math.max(delay - (now - latest), 0);
			console.log(`Throttle delay: ${waitTime}`);
			if (waitTime > 0) {
				await sleep(waitTime);
			}
			try {
				resolve(await callback());
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
