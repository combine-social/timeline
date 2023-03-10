import { get, set, statusKey } from '$lib/cache';
import { getContext } from '$lib/mastodon';
import { getContextInfo } from '$lib/mastodon/status-id';
import { next, send } from '$lib/queue';

interface ContextRequest {
	statusURL: string;
	instanceURL: string;
}

export async function getNextContext(instance: string): Promise<void> {
	try {
		const request = await next<ContextRequest>(instance);
		if (!request) return;
		set(statusKey(request.instanceURL, request.statusURL), true);
		const context = await getContext(request.instanceURL, request.statusURL);
		for (const child of context.descendants) {
			if (!child.url) continue;
			if (!(await get(statusKey(request.instanceURL, child.url)))) {
				const info = getContextInfo(child);
				if (!info) continue;
				await send(info.instanceURL, info);
			}
		}
	} catch (error) {
		console.error(error);
	}
}
