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
		throttled(instanceURL, async () => {
			first = func();
			return null;
		});
		throttled(instanceURL, async () => {
			second = func();
			return null;
		});
		await sleep(2100);
		expect(func).toBeCalledTimes(2);
		expect(second.getTime() - first.getTime()).toBeGreaterThan(1900);
	});
});
