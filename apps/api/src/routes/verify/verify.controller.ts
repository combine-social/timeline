import { isInstance } from '$lib/mastodon';
import Express from 'express';
import type {
	VerifyResponseBody,
} from 'types';

interface VerifyRequestParameters {
	host: string;
}

export async function verify(
	req: Express.Request<VerifyRequestParameters, VerifyResponseBody, void, VerifyRequestParameters>,
	res: Express.Response<VerifyResponseBody>
) {
	const instanceURL = req.query.host;
	if (!instanceURL || instanceURL.length === 0 || !(await isInstance(instanceURL))) {
		return res.status(400).send({
            verified: false,
			text: `${instanceURL} does not appear to be a Mastodon instance (or connection failed)`
		});
	}
}
