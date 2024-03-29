import { getAccessToken, getAuthorizationURL, getUsername, registerApplication } from '$lib/auth';
import type { RegistrationDTO, TokenDTO } from 'types';
import {
	RegistrationModel,
	TokenModel,
	createRegistration,
	findRegistrationByInstance,
	findRegistrationByNonce,
	getTokenCount,
	upsertToken
} from 'repository';

const workerCount = parseInt(process.env.WORKER_COUNT || '1');

function registrationDtoToModel(
	dto: RegistrationDTO,
	instance_url: string,
	nonce: string
): RegistrationModel {
	const model = {
		...dto,
		registration_id: dto.id,
		instance_url,
		nonce,
		sns: 'mastodon' // TODO: call sns detector service
	};
	delete model.id;
	return model as unknown as RegistrationModel;
}

function tokenDtoToModel(
	dto: TokenDTO,
	registration: RegistrationModel,
	username: string
): TokenModel {
	return {
		...dto,
		username,
		registration
	} as TokenModel;
}

async function getWorkerId(): Promise<number> {
	const tokenCount = await getTokenCount();
	return (tokenCount % workerCount) + 1;
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

export async function authenticate(nonce: string, code: string): Promise<string | undefined> {
	const registration = await findRegistrationByNonce(nonce);
	console.log(`Found ${JSON.stringify(registration, null, 2)}`);
	if (!registration) return undefined;
	const dto = await getAccessToken(
		registration.instance_url,
		registration.client_id,
		registration.client_secret,
		registration.redirect_uri,
		code
	);
	console.log(`Got ${JSON.stringify(dto, null, 2)}`);
	if (!dto) return undefined;
	const username = await getUsername(dto, registration.instance_url);
	const model = tokenDtoToModel(dto, registration, username);
	model.worker_id = await getWorkerId();
	await upsertToken(model);
	return username;
}
