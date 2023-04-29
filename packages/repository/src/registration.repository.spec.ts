import { afterEach, describe, expect, it } from '@jest/globals';
import { initializeMockDB, closeDB } from './db';

import { createRegistration } from './registration.repository';
import { createMockQueryResult } from 'slonik';

afterEach(async () => {
	try {
		await closeDB();
	} catch {
		/* empty */
	}
});

describe('createRegistration', () => {
	it('creates a valid registration', async () => {
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
		const model = await createRegistration({
			instance_url: 'https://example.com',
			registration_id: '1',
			name: 'a',
			website: 'https://example.com/about',
			redirect_uri: 'htpps://example.com/code',
			client_id: 'a',
			client_secret: 'b',
			vapid_key: 'c',
			nonce: 'd'
		});
		expect(values).toEqual([
			'https://example.com',
			'1',
			'a',
			'https://example.com/about',
			'htpps://example.com/code',
			'a',
			'b',
			'c',
			'd'
		]);
		expect(model.id).toEqual(1);
	});
});
