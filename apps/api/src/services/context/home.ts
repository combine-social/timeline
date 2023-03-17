import { deleteToken, findAllTokens, TokenModel, updateToken } from '$lib/auth';
import { get, set, statusKey } from '$lib/cache';
import { throttled } from '$lib/mastodon';
import { send } from '$lib/queue';
import { login, mastodon } from 'masto';

/*
  If requests with a token fails for more than 10 minutes
  (1 request every 2 seconds) then assume that it has been
  revoked and delete it.
*/
const max_fail_count = 60 * 5;

export async function getAllHomes(): Promise<void> {
	// prettier-ignore
	await Promise.all([
    (await findAllTokens()) // find all auth tokens
      .map((token) => getHome(token)) // get home timeline for each
  ])
}

async function verifiedClient(token: TokenModel): Promise<mastodon.Client | null> {
	const client = await login({
		url: `https://${token.registration.instance_url}`,
		accessToken: token.access_token,
		disableVersionCheck: true,
		disableDeprecatedWarning: true
	});
	try {
		const account = await client.v1.accounts.verifyCredentials();
		if (!account.id || account.suspended) {
			throw 'unauthorized';
		}
		token.fail_count = 0;
		await updateToken(token);
		return client;
	} catch {
		const failures = (token.fail_count || 0) + 1;
		console.error(`Failed getting status, attempt no: ${failures}`);
		if (failures > max_fail_count) {
			await deleteToken(token.id);
			return null;
		} else {
			token.fail_count = failures;
			await updateToken(token);
			return client;
		}
	}
}

async function getStatuses(
	instanceURL: string,
	client: mastodon.Client,
	since = new Date().getTime() - 1000 * 60 * 60 * 24
): Promise<mastodon.v1.Status[]> {
	const statuses: mastodon.v1.Status[] = [];
	let batch: mastodon.v1.Status[] | null = [];
	const pager = client.v1.timelines.listHome({
		limit: 40
	});
	do {
		batch = await throttled(instanceURL, async () => {
			const result = await pager.next();
			const page = result.value;
			return page?.filter((status) => new Date(status.createdAt).getTime() > since) || [];
		});
		statuses.concat(batch || []);
	} while (batch?.length || 0 > 0);
	return statuses;
}

/*
  Fetch home timeline with a given auth token.
  For each status build a context request and send it to the
  instance queue if it hasn't recently been fetched for this instance.
*/
export async function getHome(
	token: TokenModel,
	since = new Date().getTime() - 1000 * 60 * 60 * 24
): Promise<void> {
	const client = await verifiedClient(token);
	if (!client) return;

	const statuses = await getStatuses(token.registration.instance_url, client, since);

	console.log(`Got ${statuses.length} statuses from ${token.registration.instance_url}`);
	for (let status of statuses) {
		if (status.reblog) status = status.reblog;
		if (!status.url) {
			console.log(`No url for status ${status.id}, skipping`);
			continue;
		}
		// prettier-ignore
		if (await get(
			statusKey(
				token.registration.instance_url,
				status.url)
			)
		) {
			console.log(`Found ${status.url} from home in cache, skipping`);
			continue; // skip this status if it has recently been fetched
		}
		console.log(`Adding ${status.url} to queue: ${token.registration.instance_url}`);
		await set(statusKey(token.registration.instance_url, status.url), true);
		await send(token.registration.instance_url, {
			instanceURL: token.registration.instance_url,
			statusURL: status.url
		});
	}
}
