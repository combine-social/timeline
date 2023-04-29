export interface ActivityPubAccount {
	'@context': [string, string, Context];
	id: string;
	type: string;
	following: string;
	followers: string;
	inbox: string;
	outbox: string;
	featured: string;
	featuredTags: string;
	preferredUsername: string;
	name: string;
	summary: string;
	url: string;
	manuallyApprovesFollowers: boolean;
	discoverable: boolean;
	published: string;
	devices: string;
	publicKey: PublicKey;
	tag: Tag[];
	attachment: Attachment[];
	endpoints: Endpoints;
	icon: Icon;
	image: Image;
}

export interface Context {
	manuallyApprovesFollowers: string;
	toot: string;
	featured: Featured;
	featuredTags: FeaturedTags;
	alsoKnownAs: AlsoKnownAs;
	movedTo: MovedTo;
	schema: string;
	PropertyValue: string;
	value: string;
	discoverable: string;
	Device: string;
	Ed25519Signature: string;
	Ed25519Key: string;
	Curve25519Key: string;
	EncryptedMessage: string;
	publicKeyBase64: string;
	deviceId: string;
	claim: Claim;
	fingerprintKey: FingerprintKey;
	identityKey: IdentityKey;
	devices: Devices;
	messageFranking: string;
	messageType: string;
	cipherText: string;
	suspended: string;
	Hashtag: string;
	focalPoint: FocalPoint;
}

export interface Featured {
	'@id': string;
	'@type': string;
}

export interface FeaturedTags {
	'@id': string;
	'@type': string;
}

export interface AlsoKnownAs {
	'@id': string;
	'@type': string;
}

export interface MovedTo {
	'@id': string;
	'@type': string;
}

export interface Claim {
	'@type': string;
	'@id': string;
}

export interface FingerprintKey {
	'@type': string;
	'@id': string;
}

export interface IdentityKey {
	'@type': string;
	'@id': string;
}

export interface Devices {
	'@type': string;
	'@id': string;
}

export interface FocalPoint {
	'@container': string;
	'@id': string;
}

export interface PublicKey {
	id: string;
	owner: string;
	publicKeyPem: string;
}

export interface Tag {
	type: string;
	href: string;
	name: string;
}

export interface Attachment {
	type: string;
	name: string;
	value: string;
}

export interface Endpoints {
	sharedInbox: string;
}

export interface Icon {
	type: string;
	mediaType: string;
	url: string;
}

export interface Image {
	type: string;
	mediaType: string;
	url: string;
}
