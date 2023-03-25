import { get, set, statusKey } from '$lib/cache';
import { getContext } from '$lib/mastodon';
import { next } from '$lib/queue';
import { ContextRequest } from '$lib/mastodon';
import { sendIfNotCached, StatusCacheMetaData } from '$lib/conditional-queue';

export async function getNextContext(instance: string): Promise<void> {
	try {
		const request = await next<ContextRequest>(instance);
		if (!request) {
			console.log(`${instance} queue is empty`);
			return;
		}
		console.log(`Got ${JSON.stringify(request)} from queue: ${instance}`);
		const meta = (await get<StatusCacheMetaData>(statusKey(instance, request.statusURL))) || {
			original: request.statusURL,
			level: 1
		};
		await set(statusKey(instance, request.statusURL), meta);
		if (meta.level > 3) {
			console.log(`Recursion too deep for child of ${meta.original}, bailing.`);
			return;
		}
		const context = await getContext(instance, request.statusURL);
		console.log(
			`Got ${context.descendants.length} descendants of ${request.statusURL} from ${meta.createdAt} at index ${meta.index}`
		);
		for (let relative of context.descendants.slice(0, 25)) {
			if (relative.reblog) relative = relative.reblog;
			if (!relative.url) continue;
			console.log(`Maybe adding ${relative.url} to queue`);
			sendIfNotCached(statusKey(instance, relative.url), instance, relative.url, {
				original: meta.original,
				index: meta.index,
				createdAt: relative.createdAt,
				level: meta.level + 1
			});
		}
	} catch (error) {
		console.error(error);
	}
}
