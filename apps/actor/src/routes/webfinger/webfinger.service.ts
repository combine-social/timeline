import type {
    WebFinger,
} from 'types';

const website = process.env.WEBSITE || 'http://localhost:5173';

export function hasResource(resource: string): boolean {
    const host = new URL(website).host;
    return resource === `acct:actor@${host}`; // currently, 'actor' is the only valid resource
}

export function getWebFinger(resource: string): WebFinger {
    const host = new URL(website).host;
    return {
        "subject": `acct:actor@${host}`,
        "links": [
            {
                "rel": "self",
                "type": "application/activity+json",
                "href": `${website}/api/v1/actor`
            }
        ]
    };
}
