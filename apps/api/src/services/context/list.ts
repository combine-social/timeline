import { findAllRegistrations } from '$lib/auth';

export async function getInstances(): Promise<string[]> {
	return (await findAllRegistrations()).map((reg) => reg.instance_url);
}
