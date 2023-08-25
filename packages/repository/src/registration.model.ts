import { RegistrationDTO } from 'types';

export interface RegistrationModel extends Omit<RegistrationDTO, 'id'> {
	id: number;
	registration_id: string;
	instance_url: string;
	nonce: string;
	sns?: string;
}
