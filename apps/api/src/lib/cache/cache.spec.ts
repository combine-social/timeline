import { get, initializeMockCache, set } from './cache';
import { beforeEach, describe, expect, it } from '@jest/globals';

beforeEach(async () => {
	await initializeMockCache();
});

describe('cache', () => {
	it('stores a value for a key', async () => {
		await set('key', 'value');
		const value = await get('key');
		expect(value).toEqual('value');
	});
});
