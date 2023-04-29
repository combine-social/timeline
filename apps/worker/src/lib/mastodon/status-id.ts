import { ContextRequest } from './contextrequest.model';

export function getContextInfo(statusURL: string): ContextRequest | null {
	const url = new URL(statusURL);
	const instanceURL = url.hostname;
	const statusID = url.pathname.split('/').pop();
	const contextURL = `https://${instanceURL}/api/v1/statuses/${statusID}/context`;
	return {
		instanceURL,
		statusURL: contextURL
	};
}
