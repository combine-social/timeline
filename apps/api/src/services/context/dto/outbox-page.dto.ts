export interface OutboxPage {
	'@context': [string, Context];
	id: string;
	type: string;
	next: string;
	prev: string;
	partOf: string;
	orderedItems: OrderedItem[];
}

export interface Context {
	ostatus: string;
	atomUri: string;
	inReplyToAtomUri: string;
	conversation: string;
	sensitive: string;
	toot: string;
	votersCount: string;
	Hashtag: string;
	blurhash: string;
	focalPoint: FocalPoint;
}

export interface FocalPoint {
	'@container': string;
	'@id': string;
}

export interface OrderedItem {
	id: string;
	type: string;
	actor: string;
	published: string;
	to: string[];
	cc: string[];
	object: OrderedItemObject;
}

export interface OrderedItemObject {
	id: string;
	type: string;
	summary: any;
	inReplyTo: any;
	published: string;
	url: string;
	attributedTo: string;
	to: string[];
	cc: string[];
	sensitive: boolean;
	atomUri: string;
	inReplyToAtomUri: any;
	conversation: string;
	content: string;
	contentMap: ContentMap;
	attachment: any[];
	tag: Tag[];
	replies: Replies;
}

export interface ContentMap {
	en: string;
}

export interface Tag {
	type: string;
	href: string;
	name: string;
}

export interface Replies {
	id: string;
	type: string;
	first: First;
}

export interface First {
	type: string;
	next: string;
	partOf: string;
	items: any[];
}
