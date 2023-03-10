import { deleteToken, findAllTokens, TokenModel, updateToken } from '$lib/auth';
import { get, statusKey } from '$lib/cache';
import { getContextInfo } from '$lib/mastodon/status-id';
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
		if (failures > max_fail_count) {
			await deleteToken(token.id);
		} else {
			token.fail_count = failures;
			await updateToken(token);
		}
	} else {
		for (const status of statuses) {
			if (!status.url) continue;
			// prettier-ignore
			if (await get(
        statusKey(
          token.registration.instance_url,
          status.url)
        )
      ) continue; // skip this status if it has recently been fetched
			const info = getContextInfo(status);
			if (!info) continue;
			await send(info.instanceURL, info);
		}
	}
}
