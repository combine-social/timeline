import { throttledRequest } from '$lib/mastodon';
import { mastodon } from 'masto';
import { ActivityPubAccount } from './dto/activitypub-account.dto';
import { OrderedItemObject, OutboxPage } from './dto/outbox-page.dto';
import { Outbox } from './dto/outbox.dto';
import { WebFinger } from './dto/webfinger.dto';

/*
  Perform a WebFinger request for a given account or username, find the account outbox,
  fetch the first page, and return any Created Note statuses up to given limit.
*/
export async function getRecentStatusesForAccount(
	account: mastodon.v1.Account | string,
	since: number,
	limit = 10
): Promise<OrderedItemObject[]> {
	const username = typeof account === 'string' ? (account as string) : account.acct;
	const instanceURL = username.slice(username.lastIndexOf('@'));
	const fingerURL = `https://${instanceURL}/.well-known/webfinger?resource=acct:${username}`;
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
