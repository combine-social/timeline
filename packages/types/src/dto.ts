export interface RegistrationDTO {
	id?: string;
	name?: string;
	website?: string;
	redirect_uri: string;
	client_id: string;
	client_secret: string;
	vapid_key?: string;
}

export interface TokenDTO {
	access_token: string;
	token_type: string;
	scope: string;
	created_at: number;
}
