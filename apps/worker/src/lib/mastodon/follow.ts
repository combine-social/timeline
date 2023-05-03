import { followKey, get, set } from '$lib/cache';
import { throttled } from '$lib/mastodon';
import { TokenModel } from 'repository';
import { mastodon } from 'masto';

// Store list of follows for an hour
const followListTimeout = 60 * 60;

export async function isFollowing(
	token: TokenModel,
	client: mastodon.Client,
	username: string
): Promise<boolean> {
	let following = await get<string[]>(followKey(token.username));
	if (!following) {
		const verify = await throttled(token.registration.instance_url, async () => {
			return await client.v1.accounts.verifyCredentials();
		});
		if (!verify) return false;
		const accounts = await throttled(token.registration.instance_url, async () => {
			return await client.v1.accounts.listFollowing(verify.id);
		});
		following = (accounts || []).map((account) => account.username);
		set(followKey(token.username), following, followListTimeout);
	}
	return following.includes(username);
}
