import { login } from 'masto';
import { TokenDTO } from 'types';

export async function getUsername(token: TokenDTO, instanceURL: string): Promise<string> {
	const client = await login({
		url: `https://${instanceURL}`,
		accessToken: token.access_token,
		disableDeprecatedWarning: true,
		disableVersionCheck: true,
		timeout: 30_000
	});
	const verify = await client.v1.accounts.verifyCredentials();
	return verify.acct.lastIndexOf('@') > 0 ? verify.acct : verify.acct + '@' + instanceURL;
}
