import { estimatedQueueLatency } from './queue';

/*
	Expire time determines how often to re-fetch from remotes.
	It is set by POLL_INTERVAL environment variable or defaults
	to every 5 minutes.
*/
const expire_time = parseInt(process.env.POLL_INTERVAL || '0') || 60 * 5;

export async function cacheDuration(queue: string): Promise<number> {
	const latency = await estimatedQueueLatency(queue);
	const expireTime = Math.max(expire_time, latency * 1.2);
	return Math.round(expireTime);
}
