import amqplib from 'amqplib';
const url = process.env.QUEUE_URL || 'amqp://localhost';

let channel: amqplib.Channel;
let connection: amqplib.Connection;

export async function initializeQueue() {
	connection = await amqplib.connect(url);
	channel = await connection.createChannel();
}

export async function next<T extends object>(queue: string): Promise<T | null> {
	await channel.assertQueue(queue);
	const message = await channel.get(queue);
	if (!message) return null;
	channel.ack(message);
	return JSON.parse(message.content.toString());
}

export async function send(queue: string, message: object) {
	await channel.assertQueue(queue);
	await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
}

export async function queueSize(queue: string) {
	const assert = await channel.assertQueue(queue);
	return assert.messageCount;
}
