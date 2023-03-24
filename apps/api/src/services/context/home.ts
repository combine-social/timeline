import { deleteToken, findAllTokens, TokenModel, updateToken } from '$lib/auth';
import { deleteKeysWithPrefix, statusKey } from '$lib/cache';
import { sendIfNotCached } from '$lib/conditional-queue';
import { throttled } from '$lib/mastodon';
import { queueSize } from '$lib/queue';
import { sleep } from '$lib/sleep';
import { login, mastodon } from 'masto';

/*
  If requests with a token fails for more than 10 minutes
  (1 request every 2 seconds) then assume that it has been
  revoked and delete it.
*/
const max_fail_count = 60 * 5;

const home_limit = 150;

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
	since = new Date().getTime() - 1000 * 60 * 60 * 24,
	limit = home_limit
): Promise<mastodon.v1.Status[]> {
	let statuses: mastodon.v1.Status[] = [];
	let batch: mastodon.v1.Status[] | null = [];
	const pager = client.v1.timelines.listHome({
		limit: 40
	});
	do {
		batch = await throttled(instanceURL, async () => {
			try {
				const result = await pager.next();
				const page = result.value;
				console.log(`Statuses page: ${JSON.stringify(page, null, 2)}`);
				return (
					page?.filter((status) => {
						const diff = new Date(status.createdAt).getTime() > since;
						console.log(
							`createdAt: (${status.createdAt} => ${new Date(status.createdAt)}), diff: ${
								new Date(status.createdAt).getTime() - since
							}, include? ${diff}`
						);
						return diff;
					}) || []
				);
			} catch (error) {
				console.error(`[getStatuses] error: ${error}`);
				return [];
			}
		});
		console.log(`Got batch length: ${batch?.length}`);
		statuses = statuses.concat(batch || []);
	} while ((statuses.length < limit && batch?.length) || 0 > 0);
	return statuses.slice(0, limit);
}

/*
  Fetch home timeline with a given auth token.
  For each status build a context request and send it to the
  instance queue if it hasn't recently been fetched for this instance.
*/
export async function getHome(
	token: TokenModel,
	since = new Date().getTime() - 1000 * 60 * 60 * 24,
	threshold = 10
): Promise<void> {
	const queue = token.registration.instance_url;

	const count = await queueSize(queue);
	if (count > threshold) return;

	await deleteKeysWithPrefix(queue);
	await sleep(5000);

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
		console.log(`Maybe adding ${status.url} to queue: ${token.registration.instance_url}`);
		await sendIfNotCached(
			statusKey(token.registration.instance_url, status.url),
			token.registration.instance_url,
			status.url,
			{
				original: status.url,
				createdAt: status.createdAt,
				index: statuses.indexOf(status),
				level: 1
			}
		);
	}
}
