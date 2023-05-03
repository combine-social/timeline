import { TokenModel } from 'repository';
import { throttled } from '$lib/mastodon';
import { mastodon } from 'masto';
import { verifiedClient } from './client';
import { sendIfNotCached } from '$lib/conditional-queue';
import { statusKey } from '$lib/cache';
import { getRecentStatusesForAccount } from './recent-statuses';

/*
  Fetch notifcations with a given auth token.
  For each notification, get the sender account, look up that account,
  get their recent statuses, and add them to the queue to be resolved
  and fetched contexts for.
*/
export async function getNotifications(
	token: TokenModel,
	since = new Date().getTime() - 1000 * 60 * 60 * 24
): Promise<void> {
	const queue = token.username;
	const instance = token.registration.instance_url;

	const client = await verifiedClient(token);
	if (!client) return;

	const accountBackfill = new Date().getTime() - 1000 * 60 * 60 * 24 * 30;

	const accounts = await getUniqueAccountsForNotifications(instance, client, since);
	for (const account of accounts) {
		const statuses = await getRecentStatusesForAccount(account, accountBackfill);
		for (const status of statuses) {
			await sendIfNotCached(queue, statusKey(instance, status.url), instance, status.url, {
				original: status.url,
				createdAt: status.published,
				index: statuses.indexOf(status),
				level: 1
			});
		}
	}
}

/*
  Iterate through notifications, fetched with a given authorized client,
  for each notification, get the account. Return unique accounts up to limit
  for notifications since given date, up to given limit.
*/
async function getUniqueAccountsForNotifications(
	instanceURL: string,
	client: mastodon.Client,
	since: number,
	limit = 25
): Promise<mastodon.v1.Account[]> {
	const pager = client.v1.notifications.list({
		limit: 30
	});
	let accounts: mastodon.v1.Account[] = [];
	let batch: mastodon.v1.Account[] | null = [];
	do {
		batch = await throttled(instanceURL, async () => {
			try {
				const result = await pager.next();
				const page = result.value;
				return (
					page
						?.filter((notif) => {
							const diff = new Date(notif.createdAt).getTime() > since;
							console.log(
								`createdAt: (${notif.createdAt} => ${new Date(notif.createdAt)}), diff: ${
									new Date(notif.createdAt).getTime() - since
								}, include? ${diff}`
							);
							return diff;
						})
						?.map((notif) => notif.account) || []
				);
			} catch (error) {
				console.error(`[getAccountsForNotifications] error: ${error}`);
				return [];
			}
		});
		console.log(`Got batch length: ${batch?.length}`);
		accounts = accounts
			.concat(batch || [])
			.filter((account, index, array) => array.indexOf(account) === index);
	} while ((accounts.length < limit && batch?.length) || 0 > 0);
	return accounts.slice(0, limit);
}
