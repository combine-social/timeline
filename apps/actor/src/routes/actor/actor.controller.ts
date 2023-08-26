import Express from 'express';
import type {
    Actor,
} from 'types';
import { getActor } from './actor.service';

export async function actor(
	req: Express.Request<void, Actor>,
	res: Express.Response<Actor>
) {
    res.status(200).send(await getActor());
}
