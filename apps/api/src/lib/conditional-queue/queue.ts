import { get, set } from '$lib/cache';
import { queueSize, send } from '$lib/queue';

/*
	Expire time determines how often to re-fetch from remotes.
	It is set by POLL_INTERVAL environment variable or defaults
	to every 5 minutes.
*/
const expire_time = parseInt(process.env.POLL_INTERVAL || '0') || 60 * 5;

/*
  Return the estimated queue latency in seconds.
*/
export async function estimatedQueueLatency(queue: string): Promise<number> {
	const requestsPerSecond = 60 / 30; // 30 requests per minute, just under 1 per second
	const size = await queueSize(queue);
	return Math.round(size / requestsPerSecond);
}

export async function fetchInterval(queue: string): Promise<number> {
	const latency = await estimatedQueueLatency(queue);
	const expireTime = Math.max(expire_time, latency);
	return Math.round(expireTime);
}

export async function sendIfNotCached(key: string, instance: string, url: string, value: object) {
	if (!(await get(key))) {
		await set(key, value, 0);
		await send(instance, {
			instanceURL: instance,
			statusURL: url
		});
	}
}
