import { publicKey } from '$lib/key';
import type {
    Actor,
} from 'types';

const website = process.env.WEBSITE || 'http://localhost:5173';

export async function getActor(): Promise<Actor> {
    return {
        "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1"
        ],

        "id": `${website}/actor`,
        "type": "Person",
        "preferredUsername": "combine.social",
        "inbox": `${website}/api/v1/actor/inbox`,

        "publicKey": {
            "id": `${website}/actor#main-key`,
            "owner": `${website}/actor`,
            "publicKeyPem": (await publicKey()),
        }
    };
}
