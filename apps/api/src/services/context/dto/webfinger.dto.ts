export interface WebFinger {
	subject: string;
	aliases: string[];
	links: Link[];
}

export interface Link {
	rel: string;
	type?: string;
	href?: string;
	template?: string;
}
