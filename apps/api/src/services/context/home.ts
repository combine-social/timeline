import { deleteToken, findAllTokens, TokenModel, updateToken } from '$lib/auth';
import { get, set, statusKey } from '$lib/cache';
import { throttledRequest } from '$lib/mastodon/throttled';
import { send } from '$lib/queue';
import { mastodon } from 'masto';

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

/*
  Fetch home timeline with a given auth token.
  For each status build a context request and send it to the
  instance queue if it hasn't recently been fetched for this instance.
*/
export async function getHome(token: TokenModel): Promise<void> {
	const url = `https://${token.registration.instance_url}/api/v1/timelines/home`;
	const statuses = await throttledRequest<mastodon.v1.Status[]>(
		token.registration.instance_url,
		url,
		`${token.token_type} ${token.access_token}`
	);
	if (!statuses) {
		const failures = (token.fail_count || 0) + 1;
		console.error(`Failed getting status, attempt no: ${failures}`);
		if (failures > max_fail_count) {
			await deleteToken(token.id);
		} else {
			token.fail_count = failures;
			await updateToken(token);
		}
	} else {
		token.fail_count = 0;
		await updateToken(token);
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
}
