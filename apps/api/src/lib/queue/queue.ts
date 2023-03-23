import amqplib from 'amqplib';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mockAmqplib from 'mock-amqplib';

const url = process.env.QUEUE_URL || 'amqp://localhost';

let channel: amqplib.Channel;
let connection: amqplib.Connection;

export async function initializeQueue() {
	connection = await amqplib.connect(url);
	channel = await connection.createChannel();
}

export async function initializeMockQueue() {
	amqplib.connect = mockAmqplib.connect;
	await initializeQueue();
}

export async function next<T extends object>(queue: string): Promise<T | null> {
	await channel.assertQueue(queue);
	const message = await channel.get(queue);
	if (!message) return null;
	console.log(`Queued message: ${message.content.toString()}`);
	channel.ack(message);
	return JSON.parse(message.content.toString());
}

export async function send(queue: string, message: object) {
	await channel.assertQueue(queue);
	await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
}

export async function queueSize(queue: string) {
	const assert = await channel.assertQueue(queue);
	console.log(`assert: ${JSON.stringify(assert)}`);
	return assert.messageCount;
}
