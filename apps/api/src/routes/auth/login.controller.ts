import { isInstance } from '$lib/mastodon';
import Express from 'express';
import type {
	AuthCodeResponseBody,
	LoginErrorBody,
	LoginReponseBody,
	LoginRequestBody
} from 'types';
import { authenticate, register } from './register.service';

interface CodeRequestParameters {
	code: string;
}

interface CodePathParameters {
	nonce: string;
}

export async function redirectToAuthUrl(
	req: Express.Request<object, LoginReponseBody | LoginErrorBody, LoginRequestBody>,
	res: Express.Response<LoginReponseBody | LoginErrorBody>
) {
	const { instanceURL } = req.body;
	if (!instanceURL || instanceURL.length === 0 || !(await isInstance(instanceURL))) {
		console.error(`Invalid body: ${JSON.stringify(req.body)}`);
		return res.status(400).send({
			error: 'Invalid request body'
		});
	}
	const authURL = await register(instanceURL);
	if (authURL) {
		res.send({
			authURL
		});
	} else {
		res.status(500).send({
			error: 'Cannot fetch auth_uri'
		});
	}
}

export async function code(
	req: Express.Request<CodePathParameters, AuthCodeResponseBody, void, CodeRequestParameters>,
	res: Express.Response<AuthCodeResponseBody>
) {
	const nonce = req.params.nonce;
	const code = req.query.code;
	const username = await authenticate(nonce, code);
	res.status(username ? 200 : 401).send({ result: username !== undefined, username });
}
