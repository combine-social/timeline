import { statusKey } from '$lib/cache';
import { sendIfNotCached } from '$lib/conditional-queue';
import { isFollowing, throttled } from '$lib/mastodon';
import { mastodon } from 'masto';
import { TokenModel } from 'repository';
import { getRecentStatusesForAccount } from './recent-statuses';

/*
  For each status, get all mentioned usernames.
*/
async function getUniqueUnfollowedUsernamesForHome(
	token: TokenModel,
	statuses: mastodon.v1.Status[],
	client: mastodon.Client
): Promise<string[]> {
	const usernames = [];
	for (const username of statuses
		.flatMap((status) => status.mentions)
		.map((mention) => mention.username)) {
		if (!(await isFollowing(token, client, username))) continue;
		usernames.push(username);
	}
	return usernames.filter((username, index, array) => array.indexOf(username) === index);
}

export async function getUnknownAccounts(
	token: TokenModel,
	statuses: mastodon.v1.Status[],
	client: mastodon.Client,
	since = new Date().getTime() - 1000 * 60 * 60 * 24 * 30
) {
	const queue = token.username;
	const instance = token.registration.instance_url;

	for (const username of await getUniqueUnfollowedUsernamesForHome(token, statuses, client)) {
		const statuses = await getRecentStatusesForAccount(username, since);
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
