import { getNextContext } from './context';
import { getAllHomes } from './home';
import { getInstances } from './list';

/*
	Expire time determines how often to re-fetch from remotes.
	It is set by POLL_INTERVAL environment variable or defaults
	to every 5 minutes.
*/
const expire_time = parseInt(process.env.POLL_INTERVAL || '0') || 60 * 5;

async function pollHomes() {
	await getAllHomes();
}

async function pollQueue() {
	// prettier-ignore
	await Promise.all([
    (await getInstances()) // each instance is also a queue, for each instance
      .map((instance) => getNextContext(instance)) // get the next context
  ]);
}

function loopHomes() {
	pollHomes();
	setTimeout(() => {
		// wait 5 minutes (or whatever is configured)
		pollHomes() // then poll
			.then(loopHomes) // when completed, repeat
			.catch((error) => {
				// on error, try again
				console.error(error);
				loopHomes();
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

export function loop() {
	loopHomes();
	loopQueue();
}
