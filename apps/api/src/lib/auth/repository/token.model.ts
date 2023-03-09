import { TokenDTO } from '$lib/auth';
import { RegistrationModel } from './registration.model';

export interface TokenModel extends TokenDTO {
	id: number;
	registration: RegistrationModel;
}
