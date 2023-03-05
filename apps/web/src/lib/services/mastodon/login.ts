import { login, mastodon } from 'masto';
import { getDefaultUserAccount } from '../store/user-account.repository';

export async function loginToDefaultAccount(): Promise<mastodon.Client | undefined> {
	const account = await getDefaultUserAccount();
	if (!account) return undefined;

	return await login({
		url: `https://${account!.instanceURL}`,
		accessToken: account!.accessToken,
		disableVersionCheck: true,
		timeout: 30_000
	});
}
