import type { mastodon } from 'masto';
import { getContextInfo } from './status-id';
import { throttledRequest } from './throttled';

/*
	Resolve a remote status and fetch context for it.
*/
export async function getContext(
	instanceURL: string,
	statusURL: string
): Promise<mastodon.v1.Context> {
	const searchURL = `https://${instanceURL}/api/v2/search?q=${encodeURIComponent(
		statusURL
	)}&resolve=true&limit=1`;
	const search = await throttledRequest<mastodon.v1.Search>(instanceURL, searchURL);
	const status = search?.statuses.shift();
	if (!status) return emptyContext();
	const context = getContextInfo(status);
	if (!context) return emptyContext();
	const result = await throttledRequest<mastodon.v1.Context>(
		context.instanceURL,
		context.contextURL
	);
	return result || emptyContext();
}

function emptyContext(): mastodon.v1.Context {
	return {
		ancestors: [],
		descendants: []
	};
}
