import { login } from 'masto';

export async function isInstance(instanceURL: string): Promise<boolean> {
	try {
		const client = await login({
			url: `https://${instanceURL}`,
			disableVersionCheck: true,
			disableDeprecatedWarning: true,
			timeout: 5000
		});
		const instance = await client.v2.instance.fetch();
		return parseInt(instance.version) >= 4;
	} catch {
		return false;
	}
}
