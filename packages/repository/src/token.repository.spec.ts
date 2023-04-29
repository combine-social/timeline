import { afterEach, describe, expect, it } from '@jest/globals';
import { initializeMockDB, closeDB } from './db';

import { upsertToken, updateToken } from './token.repository';
import { createMockQueryResult } from 'slonik';

afterEach(async () => {
	try {
		await closeDB();
	} catch {
		/* empty */
	}
});

describe('upsertToken', () => {
	it('creates or updates a valid token', async () => {
		let values;
		initializeMockDB({
			query: async (sql, v) => {
				values = v;
				return createMockQueryResult([
					{
						id: 1
					}
				]);
			}
		});
		const model = await upsertToken({
			username: 'a',
			access_token: 'b',
			token_type: 'c',
			scope: 'd',
			created_at: 1678953916,
			registration: {
				id: 2,
				instance_url: 'https://example.com',
				registration_id: '1',
				name: 'a',
				website: 'https://example.com/about',
				redirect_uri: 'htpps://example.com/code',
				client_id: 'a',
				client_secret: 'b',
				vapid_key: 'c',
				nonce: 'd'
			},
			fail_count: 0
		});
		expect(values).toEqual([
			'a', // username
			'b', // access_token
			'c', // token_type
			'd', // scope
			1678953916, // created_at
			2, // registration_id
			0, // fail_count
			'b', // access_token ( on conflict )
			'c', // token_type ( on conflict )
			'd', // scope ( on conflict )
			1678953916, // created_at ( on conflict )
			2, // registration_id ( on conflict )
			0, // fail_count ( on conflict )
			'a' // username ( where clause in on conflict )
		]);
		expect(model.id).toEqual(1);
	});
});

describe('updateToken', () => {
	it('updates a valid token', async () => {
		let values;
		initializeMockDB({
			query: async (sql, v) => {
				values = v;
				return createMockQueryResult([]);
			}
		});
		await updateToken({
			id: 1,
			username: 'a',
			access_token: 'b',
			token_type: 'c',
			scope: 'd',
			created_at: 1678953916,
			registration: {
				id: 2,
				instance_url: 'https://example.com',
				registration_id: '1',
				name: 'a',
				website: 'https://example.com/about',
				redirect_uri: 'htpps://example.com/code',
				client_id: 'a',
				client_secret: 'b',
				vapid_key: 'c',
				nonce: 'd'
			},
			fail_count: 0
		});
		expect(values).toEqual([
			'a', // username
			'b', // access_token
			'c', // token_type
			'd', // scope
			1678953916, // created_at
			2, // registration_id
			0, // fail_count
			1 // id
		]);
	});
});
