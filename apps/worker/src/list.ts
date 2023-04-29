import { findAllTokens, TokenModel } from 'repository';

export async function getTokens(): Promise<TokenModel[]> {
	return await findAllTokens();
}
