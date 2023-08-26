import Express from 'express';
import type {
    WebFinger,
} from 'types';
import { getWebFinger, hasResource } from './webfinger.service';

interface WebFingerRequestParameters {
	resource: string;
}

export async function webfinger(
	req: Express.Request<WebFingerRequestParameters, WebFinger, void, WebFingerRequestParameters>,
	res: Express.Response<WebFinger | ''>
) {
	const resource = req.query.resource;
    if (hasResource(resource)) {
        res.status(200).send(getWebFinger(resource));
    } else {
        res.status(404).send('');
    }
}
