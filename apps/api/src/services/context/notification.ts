import { TokenModel } from '$lib/auth';
import { throttled, throttledRequest } from '$lib/mastodon';
import { mastodon } from 'masto';
import { ActivityPubAccount } from './dto/activitypub-account.dto';
import { verifiedClient } from './client';
import { WebFinger } from './dto/webfinger.dto';
import { Outbox } from './dto/outbox.dto';
import { OrderedItemObject, OutboxPage } from './dto/outbox-page.dto';
import { sendIfNotCached } from '$lib/conditional-queue';
import { statusKey } from '$lib/cache';

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

	const accounts = await getUniqueAccountsForNotifications(instance, client, since);
	for (const account of accounts) {
		const statuses = await getRecentStatusesForAccount(account, since);
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

/*
  Perform a WebFinger request for a given account, find the account outbox,
  fetch the first page, and return any Created Note statuses up to given limit.
*/
async function getRecentStatusesForAccount(
	account: mastodon.v1.Account,
	since: number,
	limit = 10
): Promise<OrderedItemObject[]> {
	const instanceURL = account.acct.slice(account.acct.lastIndexOf('@'));
	const fingerURL = `https://${instanceURL}/.well-known/webfinger?resource=acct:${account.acct}`;
	const finger = await throttledRequest<WebFinger>(instanceURL, fingerURL);
	if (!finger) return [];
	const link = finger.links
		.filter((link) => link.rel === 'self' && link.type === 'application/activity+json')
		.shift();
	if (!link || !link.href) return [];
	const accountURL = link.href;
	const accountAP = await throttledRequest<ActivityPubAccount>(instanceURL, accountURL, undefined, {
		Accept: 'application/activity+json'
	});
	if (!accountAP) return [];
	const outbox = await throttledRequest<Outbox>(instanceURL, accountAP.outbox);
	if (!outbox) return [];
	const page = await throttledRequest<OutboxPage>(instanceURL, outbox.first);
	return page ? getStatusURLsFromOutboxPage(page, since).slice(0, limit) : [];
}

export function getStatusURLsFromOutboxPage(page: OutboxPage, since: number): OrderedItemObject[] {
	try {
		return (
			page.orderedItems
				.filter((item) => new Date(item.published).getTime() > since)
				.filter((item) => item.type === 'Create')
				.filter((item) => item.object.type === 'Note')
				.filter((item) => !!item.object.url)
				.map((item) => item.object) || []
		);
	} catch (error) {
		console.error(`Failed getting orderedItems from page: ${error}`);
		console.error(page);
		return [];
	}
}
