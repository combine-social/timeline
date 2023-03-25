import { get, set } from '$lib/cache';
import { send } from '$lib/queue';
import { StatusCacheMetaData } from './meta.model';

/*
	Send message to queue if a matching key does not already exist in the cache.

	This is used for bookkeeping of scheduled tesks to be performed.
	The value is set in the cache on the given key, which may contain meta data
	for the given task.
*/
export async function sendIfNotCached(
	key: string,
	instance: string,
	url: string,
	value: StatusCacheMetaData
) {
	if (!(await get(key))) {
		await set(key, value, 0);
		await send(instance, {
			instanceURL: instance,
			statusURL: url
		});
	}
}
