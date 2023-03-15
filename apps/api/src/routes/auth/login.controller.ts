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

const website = process.env.WEBSITE || 'http://localhost:5173';

export async function redirectToAuthUrl(
	req: Express.Request<object, LoginReponseBody | LoginErrorBody, LoginRequestBody>,
	res: Express.Response<LoginReponseBody | LoginErrorBody>
) {
	const { instanceURL } = req.body;
	if (!instanceURL || instanceURL.length === 0) {
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
	console.log(`nonce: ${req.params.nonce}`);
	console.log(`code: ${req.query.code}`);
	const nonce = req.params.nonce;
	const code = req.query.code;
	const url = new URL(website + req.url);
	url.search = '';
	console.log(`url: ${url.toString()}`);
	const result = await authenticate(url.toString(), nonce, code);
	res.status(result ? 200 : 401).send({ result });
}
