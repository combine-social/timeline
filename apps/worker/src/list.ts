import { findAllTokens, TokenModel } from 'repository';

const wokerId = parseInt(process.env.WORKER_ID || '1') || 1;

export async function getTokens(): Promise<TokenModel[]> {
	return await findAllTokens();
}
