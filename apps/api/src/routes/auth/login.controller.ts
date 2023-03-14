import Express from 'express';
import type { AuthCodeResponseBody, LoginRequestBody } from 'types';
import { authenticate, register } from './register.service';

interface CodeRequestParameters {
	code: string;
}

const website = process.env.WEBSITE || 'http://localhost:5173';

export async function redirectToAuthUrl(
	req: Express.Request<object, string, LoginRequestBody>,
	res: Express.Response
) {
	const { instanceURL } = req.body;
	const url = await register(instanceURL);
	if (url) {
		res.redirect(url);
	} else {
		res.status(500).send({
			error: 'Cannot fetch auth_uri'
		});
	}
}

export async function code(
	req: Express.Request<object, AuthCodeResponseBody, void, CodeRequestParameters>,
	res: Express.Response<AuthCodeResponseBody>
) {
	console.log(`params: ${req.query.code}`);
	const code = req.query.code;
	const url = new URL(website + req.url);
	url.search = '';
	console.log(`url: ${url.toString()}`);
	const result = await authenticate(url.toString(), code);
	res.status(result ? 200 : 401).send({ result });
}
