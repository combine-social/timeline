import { connect } from '$lib/db';
import { sql } from 'slonik';
import { RegistrationModel } from './registration.model';
import { TokenModel } from './token.model';

/*
  A row in the result of a query to tokens joined with registrations.
  The rows have registration_id which should be replaced with
  registration populated with the joined columns from registrations.
*/
interface TokenRow {
	token: Omit<TokenModel, 'registration'> & { registration_id?: number };
	registration: RegistrationModel;
}

export async function findAllTokens(): Promise<TokenModel[]> {
	return await connect(async (connection) => {
		try {
			const rows = await connection.many<TokenRow>(sql`
        select 
          to_json(r.*) as registration,
          to_json(t.*) as token
        from registrations r 
        join tokens t 
          on r.id = t.registration_id
      `);
			return rows.map((row) => {
				const token = row.token;
				delete token.registration_id;
				return {
					...token,
					registration: row.registration
				};
			});
		} catch {
			return [];
		}
	});
}

export async function findTokenById(id: number): Promise<TokenModel | null> {
	return await connect(async (connection) => {
		const row = await connection.maybeOne<TokenRow>(sql`
      select 
        to_json(r.*) as registration,
        to_json(t.*) as token
      from registrations r 
      join tokens t 
        on r.id = t.registration_id
      where t.id = ${id}
    `);
		if (!row) return null;
		const token = row.token;
		delete token.registration_id;
		return {
			...token,
			registration: row.registration
		};
	});
}

export async function findFirstTokenByInstance(instanceURL: string): Promise<TokenModel | null> {
	return await connect(async (connection) => {
		const row = await connection.maybeOne<TokenRow>(sql`
      select 
        to_json(r.*) as registration,
        to_json(t.*) as token
      from registrations r 
      join tokens t 
        on r.id = t.registration_id
      where r.instance_url = ${instanceURL}
      limit 1
    `);
		if (!row) return null;
		const token = row.token;
		delete token.registration_id;
		return {
			...token,
			registration: row.registration
		};
	});
}

export async function upsertToken(token: TokenModel): Promise<TokenModel> {
	return await connect(async (connection) => {
		const id = await connection.oneFirst<number>(sql`
      insert into tokens
      (
        username,
        access_token,
        token_type,
        scope,
        created_at,
        registration_id
      ) values (
        ${token.username},
        ${token.access_token},
        ${token.token_type},
        ${token.scope},
        ${token.created_at},
        ${token.registration.id}
      ) on conflict on constraint uniq_username do update set 
        access_token = ${token.access_token},
        token_type = ${token.token_type},
        scope = ${token.scope},
        created_at = ${token.created_at},
        registration_id = ${token.registration.id}
      where tokens.username = ${token.username}
      returning id
    `);
		return {
			...token,
			id
		};
	});
}

export async function deleteToken(id: number) {
	await connect(async (connection) => {
		await connection.query(sql`
      delete from tokens
      where id = ${id}
    `);
	});
}

export async function updateToken(token: TokenModel): Promise<void> {
	await connect(async (connection) => {
		await connection.query(sql`
      update tokens set
        username = ${token.username},
        access_token = ${token.access_token},
        token_type = ${token.token_type},
        scope = ${token.scope},
        created_at = ${token.created_at},
        registration_id = ${token.registration.id}
      where id = ${token.id}
    `);
	});
}
