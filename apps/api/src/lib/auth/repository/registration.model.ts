import { RegistrationDTO } from '$lib/auth';

export interface RegistrationModel extends Omit<RegistrationDTO, 'id'> {
	id: number;
	registration_id: string;
	instance_url: string;
}
