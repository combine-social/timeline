import { TokenModel } from 'repository';
import type { mastodon } from 'masto';
import { getContextInfo } from './status-id';
import { throttledRequest } from './throttled';

/*
	Resolve a remote status and fetch context for it.
*/
export async function getContext(
	token: TokenModel,
	statusURL: string
): Promise<mastodon.v1.Context> {
	const instanceURL = token.registration.instance_url;
	const searchURL = `https://${instanceURL}/api/v2/search?q=${encodeURIComponent(
		statusURL
	)}&resolve=true&limit=1&type=statuses`;
	console.log(`Instance ${instanceURL} matches token: ${token?.id}`);
	const search = await throttledRequest<mastodon.v1.Search>(
		instanceURL,
		searchURL,
		`${token.token_type} ${token.access_token}`
	);
	console.log(`Found ${search?.statuses?.length} statuses from search: ${searchURL}`);
	const status = search?.statuses.shift();
	const resultURL = status?.url;
	if (!resultURL) return emptyContext();
	const context = getContextInfo(resultURL);
	console.log(`Result context url: ${context?.statusURL}`);
	if (!context) return emptyContext();
	const result = await throttledRequest<mastodon.v1.Context>(
		context.instanceURL,
		context.statusURL // this is the status context request url
	);
	console.log(`Remote context has ${result?.descendants?.length} descendants`);
	return result || emptyContext();
}

function emptyContext(): mastodon.v1.Context {
	return {
		ancestors: [],
		descendants: []
	};
}
