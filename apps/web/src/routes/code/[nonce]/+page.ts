export interface Parameters {
	nonce: string;
}

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	return {
		nonce: params.nonce
	};
}
