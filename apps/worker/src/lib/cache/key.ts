export function statusKey(instanceURL: string, statusURL: string): string {
	return `${instanceURL}:${statusURL}`;
}

export function instanceKey(instanceURL: string): string {
	return `${instanceURL}`;
}

export function followKey(username: string): string {
	return `${username}:following`;
}
