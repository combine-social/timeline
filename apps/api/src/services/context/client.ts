import { TokenModel, updateToken, deleteToken } from '$lib/auth';
import { throttled } from '$lib/mastodon';
import { mastodon, login } from 'masto';

/*
  If requests with a token fails for more than 10 minutes
  (1 request every 2 seconds) then assume that it has been
  revoked and delete it.
*/
const max_fail_count = 60 * 5;

export async function verifiedClient(token: TokenModel): Promise<mastodon.Client | null> {
	return await throttled(token.registration.instance_url, async () => {
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
	});
}
