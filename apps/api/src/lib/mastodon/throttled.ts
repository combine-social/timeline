import { get, instanceKey, set } from '$lib/cache';
import { sleep } from '$lib/sleep';
import fetch from 'node-fetch';
import semaphore from 'semaphore';

const semaphores = new Map<string, semaphore.Semaphore>();

/*
	Request a resource from an instance.

	This uses throttled() to ensure that rate limits are adhered to
*/
export function throttledRequest<T extends object>(
	instanceURL: string,
	requestURL: string,
	auth?: string,
	extraHeaders?: object
): Promise<T | null> {
	return throttled(instanceURL, async () => {
		const response = await fetch(requestURL, {
			headers: {
				...(auth ? { Authorization: auth } : {}),
				...(extraHeaders || {})
			},
			redirect: 'follow'
		});
		if (response.status >= 400) {
			return null;
		} else {
			return await response.json();
		}
	});
}

/*
	Perform a task at an instance.

	To ensure that rate limits are not hit, request rates are
	throttled to one request to a given instance 30 times
	per minute - just under the rate limit.

	Rate limits are set to 300 requests per 5 minutes, meaning
	maximum one request per second (per ip and per user).

	Setting this to 30 requests per minute keeps it just under the limit.
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
				await set(instanceKey(instanceURL), new Date().getTime(), 300);
				sem.leave();
			}
		});
	});
}
