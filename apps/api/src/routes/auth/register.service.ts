import {
	createRegistration,
	createToken,
	findRegistrationByInstance,
	findRegistrationByNonce,
	getAccessToken,
	getAuthorizationURL,
	registerApplication
} from '$lib/auth';
import type { RegistrationDTO, TokenDTO, RegistrationModel, TokenModel } from '$lib/auth';

function registrationDtoToModel(
	dto: RegistrationDTO,
	instance_url: string,
	nonce: string
): RegistrationModel {
	const model = {
		...dto,
		registration_id: dto.id,
		instance_url,
		nonce
	};
	delete model.id;
	return model as unknown as RegistrationModel;
}

function tokenDtoToModel(dto: TokenDTO, registration: RegistrationModel): TokenModel {
	return {
		...dto,
		registration
	} as TokenModel;
}

export async function register(instanceURL: string): Promise<string> {
	let registration = await findRegistrationByInstance(instanceURL);
	if (!registration) {
		const dto = await registerApplication(instanceURL);
		const model = registrationDtoToModel(dto, instanceURL, dto.nonce);
		registration = await createRegistration(model);
	}
	return await getAuthorizationURL(instanceURL, registration.client_id, registration.redirect_uri);
}

export async function authenticate(url: string, nonce: string, code: string): Promise<boolean> {
	const registration = await findRegistrationByNonce(nonce);
	console.log(`Found ${JSON.stringify(registration, null, 2)}`);
	if (!registration) return false;
	const dto = await getAccessToken(
		registration.instance_url,
		registration.client_id,
		registration.client_secret,
		registration.redirect_uri,
		code
	);
	console.log(`Got ${JSON.stringify(dto, null, 2)}`);
	if (!dto) return false;
	const model = tokenDtoToModel(dto, registration);
	await createToken(model);
	return true;
}
