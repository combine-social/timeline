import { findTokensWorkerId, TokenModel } from 'repository';

const wokerId = parseInt(process.env.WORKER_ID || '1');

export async function getTokens(): Promise<TokenModel[]> {
	return await findTokensWorkerId(wokerId);
}
