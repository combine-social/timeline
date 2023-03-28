import { findAllTokens, TokenModel } from '$lib/auth';

export async function getTokens(): Promise<TokenModel[]> {
	return await findAllTokens();
}
