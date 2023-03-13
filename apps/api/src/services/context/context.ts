import { get, set, statusKey } from '$lib/cache';
import { getContext } from '$lib/mastodon';
import { getContextInfo } from '$lib/mastodon/status-id';
import { next, send } from '$lib/queue';
import { ContextRequest } from '$lib/mastodon';

export async function getNextContext(instance: string): Promise<void> {
	try {
		const request = await next<ContextRequest>(instance);
		if (!request) {
			console.log(`${instance} queue is empty`);
			return;
		}
		console.log(`Got ${JSON.stringify(request)} from queue: ${instance}`);
		set(statusKey(instance, request.statusURL), true);
		const context = await getContext(instance, request.statusURL);
		console.log(`Got ${context.descendants.length} descendants of ${request.statusURL}`);
		for (let familyMember of context.descendants.concat(context.ancestors)) {
			if (familyMember.reblog) familyMember = familyMember.reblog;
			if (familyMember.url && !(await get(statusKey(instance, familyMember.url)))) {
				console.log(`Adding ${familyMember.url} to queue`);
				await set(statusKey(instance, familyMember.url), true);
				await send(instance, {
					instanceURL: instance,
					statusURL: familyMember.url
				});
			}
		}
	} catch (error) {
		console.error(error);
	}
}
