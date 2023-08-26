import type {
    WebFinger,
} from 'types';

const website = process.env.WEBSITE || 'http://localhost:5173';

export function hasResource(resource: string): boolean {
    const host = new URL(website).host;
    return resource === `acct:actor@${host}`; // currently, 'actor' is the only valid resource
}

function username(resource: string): string | undefined {
    return resource.split(':').at(1)?.split('@').at(0);
}

export function getWebFinger(resource: string): WebFinger {
    let user = username(resource);
    return {
        "subject": `acct:${user}@${website}`,
        "links": [
            {
                "rel": "self",
                "type": "application/activity+json",
                "href": `${website}/${user}`
            }
        ]
    };
}
