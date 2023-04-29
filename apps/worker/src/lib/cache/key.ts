export function statusKey(instanceURL: string, statusURL: string): string {
	return `${instanceURL}:${statusURL}`;
}

export function instanceKey(instanceURL: string): string {
	return `${instanceURL}`;
}
