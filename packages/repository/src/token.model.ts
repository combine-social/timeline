import { TokenDTO } from 'types';
import { RegistrationModel } from './registration.model';

export interface TokenModel extends TokenDTO {
	id: number;
	username: string;
	registration: RegistrationModel;
	fail_count?: number;
	worker_id: number;
}
