import { getNextContext } from './context';
import { getAllHomes } from './home';
import { getInstances } from './list';

async function poll() {
	await getAllHomes();
	// prettier-ignore
	await Promise.all([
    (await getInstances()) // each instance is also a queue, for each instance
      .map((instance) => getNextContext(instance)) // get the next context
  ]);
}

export function loop() {
	setTimeout(() => {
		// wait 2 seconds
		poll() // then poll
			.then(loop) // when completed, repeat
			.catch((error) => {
				// on error, try again
				console.error(error);
				loop();
			});
	}, 2000);
}
