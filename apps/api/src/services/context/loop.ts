import { getNextContext } from './context';
import { getAllHomes } from './home';
import { getInstances } from './list';

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
		// wait 15 minutes
		pollHomes() // then poll
			.then(loopHomes) // when completed, repeat
			.catch((error) => {
				// on error, try again
				console.error(error);
				loopHomes();
			});
	}, 15 * 60 * 1000);
}

function loopQueue() {
	setTimeout(() => {
		// wait 2 seconds
		pollQueue() // then poll
			.then(loopQueue) // when completed, repeat
			.catch((error) => {
				// on error, try again
				console.error(error);
				loopQueue();
			});
	}, 2000);
}

export function loop() {
	loopHomes();
	loopQueue();
}
