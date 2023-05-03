import { describe, expect, it } from '@jest/globals';
import { getStatusURLsFromOutboxPage } from './recent-statuses';
import { page } from './notification.dto.spec';

describe('recent-statuses', () => {
	it('filters and maps page to status urls', async () => {
		const since = new Date('2023-03-21T00:00:00Z');
		const statuses = getStatusURLsFromOutboxPage(page, since.getTime());
		expect(statuses.length).toBe(1);
		expect(statuses[0].url).toBe('https://example.com/@SomeUser/110073411005561432');
	});
});
