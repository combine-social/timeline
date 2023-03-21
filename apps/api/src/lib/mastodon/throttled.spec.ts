import { initializeMockCache } from '$lib/cache';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { throttled } from './throttled';

async function sleep(millis: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, millis);
	});
}

beforeEach(async () => {
	await initializeMockCache();
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
		const minimumDelay = 60_000 / requestsPerMinute - 100;
		const safeWaitTime = minimumDelay + 200;
		throttled(
			instanceURL,
			async () => {
				first = func();
				return null;
			},
			requestsPerMinute
		);
		throttled(
			instanceURL,
			async () => {
				second = func();
				return null;
			},
			requestsPerMinute
		);
		await sleep(safeWaitTime);
		expect(func).toBeCalledTimes(2);
		expect(second.getTime() - first.getTime()).toBeGreaterThan(minimumDelay);
	});
});
