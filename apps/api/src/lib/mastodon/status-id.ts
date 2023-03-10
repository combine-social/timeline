import type { mastodon } from 'masto';

export interface ContextInfo {
	instanceURL: string; // actually a hostname
	contextURL: string; // url used for context request
}

export function getContextInfo(status: mastodon.v1.Status): ContextInfo | null {
	if (!status.url) return null;
	const instanceURL = new URL(status.url).hostname;
	return {
		instanceURL,
		contextURL: `https://${instanceURL}/api/v1/statuses/${status.id}/context`
	};
}
