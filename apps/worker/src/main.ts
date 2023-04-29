import { initializeDB, ping } from 'repository';
import { initializeQueue } from '$lib/queue';
import { initializeCache } from '$lib/cache';
import { loop } from './loop';

initializeDB();
(async () => {
	try {
		await ping();
		console.log(`⚡️[server]: DB connection up!`);
		await initializeQueue();
		console.log(`⚡️[server]: Queue connection up!`);
		await initializeCache();
		console.log(`⚡️[server]: Cache connection up!`);
		loop();
	} catch (error) {
		console.error(`✖︎ [server]: DB connection failed: ${error}`);
	}
})();
