/*
This was derived from https://github.com/cheeaun/phanpy and is covered by the MIT license:

The MIT License (MIT)
Copyright © 2023 Lim Chee Aun, http://cheeaun.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the “Software”), to deal in the Software without
restriction, including without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import fetch from 'node-fetch';
import type { RegistrationDTO } from 'types';
import { v4 as uuidv4 } from 'uuid';
import type { TokenDTO } from 'types';

const client_name = process.env.CLIENT_NAME || 'Post Context';
const website = process.env.WEBSITE || 'http://localhost:5173';

export async function registerApplication(
	instanceURL: string
): Promise<RegistrationDTO & { nonce: string }> {
	const nonce = uuidv4();
	const registrationParams = new URLSearchParams({
		client_name,
		redirect_uris: `${website}/code/${nonce}`,
		scopes: 'read',
		website
	});
	const registrationResponse = await fetch(`https://${instanceURL}/api/v1/apps`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: registrationParams.toString()
	});
	const registrationJSON: RegistrationDTO = await registrationResponse.json();
	console.log({ registrationJSON });
	return {
		...registrationJSON,
		nonce
	};
}

export async function getAuthorizationURL(
	instanceURL: string,
	client_id: string,
	redirect_uri: string
) {
	const authorizationParams = new URLSearchParams({
		client_id,
		scope: 'read',
		redirect_uri,
		// redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
		response_type: 'code'
	});
	const authorizationURL = `https://${instanceURL}/oauth/authorize?${authorizationParams.toString()}`;
	return authorizationURL;
}

export async function getAccessToken(
	instanceURL: string,
	client_id: string,
	client_secret: string,
	redirect_uri: string,
	code: string
): Promise<TokenDTO | null> {
	const params = new URLSearchParams({
		client_id,
		client_secret,
		redirect_uri,
		grant_type: 'authorization_code',
		code,
		scope: 'read'
	});
	const tokenResponse = await fetch(`https://${instanceURL}/oauth/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: params.toString()
	});
	if (tokenResponse.status === 200) {
		const tokenJSON = await tokenResponse.json();
		return tokenJSON as TokenDTO;
	} else {
		console.error(`Failed getting token: ${tokenResponse.statusText}`);
		return null;
	}
}
