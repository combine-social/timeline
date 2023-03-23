import { RedisClientType } from '@redis/client';
import { createClient } from 'redis';
import { MockRedisClient } from './mock';

let client: RedisClientType;

/*
	Expire time determines how often to re-fetch from remotes.
	It is set by POLL_INTERVAL environment variable or defaults
	to every 5 minutes.
*/
const expire_time = parseInt(process.env.POLL_INTERVAL || '0') || 60 * 5;

export async function initializeCache() {
	client = createClient({
		url: process.env.REDIS_URL || 'redis://localhost:6379'
	});
	client.on('error', (err) => {
		console.error(`Redis error: ${err}`);
		client.disconnect();
		setTimeout(() => {
			console.log('Reconnecting to redis...');
			initializeCache().then();
		}, 5000);
	});
	await client.connect();
}

export async function initializeMockCache() {
	client = new MockRedisClient() as unknown as RedisClientType;
}

export async function get<T>(key: string): Promise<T | null> {
	const value = await client.get(key);
	return value ? JSON.parse(value) : null;
}

export async function set<T>(key: string, value: T, expireTime = expire_time) {
	console.log(`cache expire time: ${expireTime}`);
	await client.set(key, JSON.stringify(value), {
		...(expireTime > 0 ? { EX: expireTime } : {})
	});
}

export async function deleteKeysWithPrefix(prefix: string): Promise<void> {
	const keys = await client.keys(`${prefix}*`);
	for (const key of keys) {
		await client.del(key);
	}
}
