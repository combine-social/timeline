import {
	createMockPool,
	createPool,
	DatabasePool,
	DatabasePoolConnection,
	MockPoolOverrides,
	sql
} from 'slonik';

const url = process.env.DB_URL || 'postgres://localhost:5432/test';

let pool: DatabasePool;

export function initializeDB() {
	pool = createPool(url);
}

export function initializeMockDB(overrides: MockPoolOverrides) {
	pool = createMockPool(overrides);
}

export async function closeDB() {
	await pool.end();
}

export declare type ConnectionRoutine<T> = (connection: DatabasePoolConnection) => Promise<T>;

export async function connect<T>(connectionRoutine: ConnectionRoutine<T>): Promise<T> {
	return await pool.connect(connectionRoutine);
}

export async function ping() {
	await connect(async () => sql`select 1`);
}
