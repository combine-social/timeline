import { connect } from '$lib/db';
import { sql } from 'slonik';
import { RegistrationModel } from './registration.model';

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

export async function findRegistrationByRedirect(
	redirect_uri: string
): Promise<RegistrationModel | null> {
	return await connect(async (connection) => {
		return await connection.maybeOne<RegistrationModel>(sql`
      select * from registrations
      where redirect_uri = ${redirect_uri}
      limit 1
    `);
	});
}

export async function createRegistration(
	registration: RegistrationModel
): Promise<RegistrationModel> {
	return await connect(async (connection) => {
		const results = await connection.query<number>(sql`
      insert into registrations
      (
        instance_url,
        registration_id,
        name,
        website,
        redirect_uri,
        client_id,
        client_secret,
        vapid_key
      ) values (
        ${registration.instance_url || null},
        ${registration.registration_id},
        ${registration.name || null},
        ${registration.website || null},
        ${registration.redirect_uri},
        ${registration.client_id},
        ${registration.client_secret},
        ${registration.vapid_key || null}
      ) returning id
    `);
		return {
			...registration,
			id: results.rows[0]
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
        vapid_key = ${registration.vapid_key || null}
      where id = ${registration.id}
    `);
	});
}
