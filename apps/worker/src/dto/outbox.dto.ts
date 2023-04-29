export interface Outbox {
	'@context': string;
	id: string;
	type: string;
	totalItems: number;
	first: string;
	last: string;
}
