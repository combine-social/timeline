import { initializeMockCache } from '$lib/cache';
import { initializeMockQueue } from '$lib/queue/queue.spec';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { throttled } from './throttled';

beforeEach(async () => {
	await initializeMockCache();
	await initializeMockQueue();
});

function getDate(): Date {
	return new Date();
}

describe('throttled', () => {
	it('rate limits requests', async () => {
		const instanceURL = 'example.com';
		const func = jest.fn(getDate);
		let first = new Date(),
			second = new Date();
		const requestsPerMinute = 600;
		const minimumDelay = 60_000 / requestsPerMinute - 50;
		await throttled(
			instanceURL,
			async () => {
				first = func();
				return null;
			},
			requestsPerMinute
		);
		await throttled(
			instanceURL,
			async () => {
				second = func();
				return null;
			},
			requestsPerMinute
		);
		expect(func).toBeCalledTimes(2);
		expect(second.getTime() - first.getTime()).toBeGreaterThan(minimumDelay);
	});
});
