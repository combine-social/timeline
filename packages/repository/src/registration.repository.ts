import { connect } from './db';
import { sql } from 'slonik';
import { RegistrationModel } from './registration.model';

export async function findAllRegistrations(): Promise<readonly RegistrationModel[]> {
	return await connect(async (connection) => {
		try {
			return await connection.many<RegistrationModel>(sql`
        select * from registrations;
      `);
		} catch {
			return [];
		}
	});
}

export async function findRegistrationByInstance(
	instanceURL: string
): Promise<RegistrationModel | null> {
	return await connect(async (connection) => {
		return await connection.maybeOne<RegistrationModel>(sql`
      select * from registrations
      where instance_url = ${instanceURL}
      limit 1
    `);
	});
}

export async function findRegistrationByNonce(nonce: string): Promise<RegistrationModel | null> {
	return await connect(async (connection) => {
		return await connection.maybeOne<RegistrationModel>(sql`
      select * from registrations
      where nonce = ${nonce}
      limit 1
    `);
	});
}

export async function createRegistration(
	registration: Omit<RegistrationModel, 'id'>
): Promise<RegistrationModel> {
	return await connect(async (connection) => {
		const id = await connection.oneFirst<number>(sql`
      insert into registrations
      (
        instance_url,
        registration_id,
        name,
        website,
        redirect_uri,
        client_id,
        client_secret,
        vapid_key,
        nonce,
        sns
      ) values (
        ${registration.instance_url || null},
        ${registration.registration_id},
        ${registration.name || null},
        ${registration.website || null},
        ${registration.redirect_uri},
        ${registration.client_id},
        ${registration.client_secret},
        ${registration.vapid_key || null},
        ${registration.nonce},
        ${registration.sns || null},
      ) returning id
    `);
		return {
			...registration,
			id
		};
	});
}

export async function updateRegistration(registration: RegistrationModel): Promise<void> {
	await connect(async (connection) => {
		await connection.query(sql`
      update registrations set
        instance_url = ${registration.instance_url || null},
        registration_id = ${registration.registration_id},
        name = ${registration.name || null},
        website = ${registration.website || null},
        redirect_uri = ${registration.client_id || null},
        client_id = ${registration.client_secret || null},
        client_secret = ${registration.vapid_key || null},
        vapid_key = ${registration.vapid_key || null},
        nonce = ${registration.nonce},
        sns = ${registration.sns || null}
      where id = ${registration.id}
    `);
	});
}
