import { findAllTokens, TokenModel } from '$lib/auth';
import { deleteKeysWithPrefix } from '$lib/cache';
import { queueSize } from '$lib/queue';
import { getNextContext } from './context';
import { getHome } from './home';
import { getTokens } from './list';
import { getNotifications } from './notification';

/*
	Expire time determines how often to re-fetch from remotes.
	It is set by POLL_INTERVAL environment variable or defaults
	to every 5 minutes.
*/
const expire_time = parseInt(process.env.POLL_INTERVAL || '0') || 60 * 5;

async function pollQueue() {
	// prettier-ignore
	await Promise.all([
		(await getTokens()) // each instance is also a queue, for each instance
			.map((token) => getNextContext(token)) // get the next context
	]);
}

function loopTokens() {
	processAllTokens();
	setTimeout(() => {
		// wait 5 minutes (or whatever is configured)
		processAllTokens() // then poll
			.then(loopTokens) // when completed, repeat
			.catch((error) => {
				// on error, try again
				console.error(error);
				loopTokens();
			});
	}, expire_time * 1000);
}

function loopQueue() {
	setTimeout(() => {
		// poll queue 30 times per minute
		pollQueue() // then poll
			.then(loopQueue) // when completed, repeat
			.catch((error) => {
				// on error, try again
				console.error(error);
				loopQueue();
			});
	}, 60_000 / 30);
}

async function processAllTokens(): Promise<void> {
	const tokens = await findAllTokens();
	await Promise.all([
		tokens.map(async (token) => {
			if (await preparePopulateQueue(token)) {
				await getHome(token);
				await getNotifications(token);
			}
		})
	]);
}

/*
	Prepare to re-populate the queue.

	Clears the cache so queue can be repopulated,
	if the current queue length is less than the given threshold.
*/
async function preparePopulateQueue(token: TokenModel, threshold = 25): Promise<boolean> {
	const queue = token.username;

	const count = await queueSize(queue);
	console.log(`Size of queue ${queue} is ${count}, skip threshold is ${threshold}.`);
	if (count > threshold) {
		console.log(`Skipping queue ${queue}`);
		return false;
	}
	console.log(`Proceeding with queue ${queue}`);

	await deleteKeysWithPrefix(queue);
	return true;
}

export function loop() {
	loopQueue();
	loopTokens();
}
