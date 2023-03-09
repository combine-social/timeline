import { connect } from '$lib/db';
import { sql } from 'slonik';
import { RegistrationModel } from './registration.model';
import { TokenModel } from './token.model';

interface TokenQueryRow {
	token: Omit<TokenModel, 'registration'> & { registration_id?: number };
	registration: RegistrationModel;
}

export async function findAllTokens(): Promise<TokenModel[]> {
	return await connect(async (connection) => {
		const rows = await connection.many<TokenQueryRow>(sql`
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
				...row.token,
				registration: row.registration
			};
		});
	});
}

export async function createToken(token: TokenModel): Promise<TokenModel> {
	return await connect(async (connection) => {
		const results = await connection.query<number>(sql`
      insert into tokens
      (
        access_token,
        token_type,
        scope,
        created_at,
        registration_id
      ) values (
        ${token.access_token},
        ${token.token_type},
        ${token.scope},
        ${token.created_at},
        ${token.registration.id}
      ) returning id
    `);
		return {
			...token,
			id: results.rows[0]
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
      update registrations set
        access_token = ${token.access_token},
        token_type = ${token.token_type},
        scope = ${token.scope},
        created_at = ${token.created_at},
        registration_id = ${token.registration.id}
      where id = ${token.id}
    `);
	});
}
