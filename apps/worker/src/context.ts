import { get, set, statusKey } from '$lib/cache';
import { getContext } from '$lib/mastodon';
import { next } from '$lib/queue';
import { ContextRequest } from '$lib/mastodon';
import { sendIfNotCached, StatusCacheMetaData } from '$lib/conditional-queue';
import { TokenModel } from 'repository';

export async function getNextContext(token: TokenModel): Promise<void> {
	try {
		const instance = token.registration.instance_url;
		const queue = token.username;
		const request = await next<ContextRequest>(queue);
		if (!request) {
			console.log(`${queue} queue is empty`);
			return;
		}
		console.log(`Got ${JSON.stringify(request)} from queue: ${instance}`);
		const meta = (await get<StatusCacheMetaData>(statusKey(instance, request.statusURL))) || {
			original: request.statusURL,
			level: 1
		};
		await set(statusKey(instance, request.statusURL), meta);
		if (meta.level > 2) {
			console.log(`Recursion too deep for child of ${meta.original}, bailing.`);
			return;
		}
		const context = await getContext(token, request.statusURL);
		console.log(
			`Got ${context.descendants.length} descendants of ${request.statusURL} from ${meta.createdAt} at index ${meta.index}`
		);
		for (let relative of context.descendants.slice(0, 25)) {
			if (relative.reblog) relative = relative.reblog;
			if (!relative.url) continue;
			console.log(`Maybe adding ${relative.url} to queue`);
			sendIfNotCached(queue, statusKey(instance, relative.url), instance, relative.url, {
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
