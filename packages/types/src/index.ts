export interface AuthCodeResponseBody {
	result: boolean;
	username?: string;
}

export interface LoginRequestBody {
	instanceURL: string;
}

export interface LoginReponseBody {
	authURL: string;
}

export interface LoginErrorBody {
	error: string;
}
