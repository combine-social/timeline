import { beforeEach, describe, expect, it } from '@jest/globals';
import amqplib from 'amqplib';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mockAmqplib from 'mock-amqplib';

import { initializeQueue, send, next } from './queue';

export async function initializeMockQueue() {
	amqplib.connect = mockAmqplib.connect;
	await initializeQueue();
}

beforeEach(async () => {
	await initializeMockQueue();
});

describe('queue', () => {
	it('sends and retrieves message on queue', async () => {
		await send('test', { body: 'value' });
		const message = await next<{ body: string }>('test');
		expect(message?.body).toBe('value');
	});
});
