export class MockRedisClient {
	cache: Map<string, string>;

	constructor() {
		this.cache = new Map<string, string>();
	}

	async get(key: string): Promise<string | undefined> {
		return this.cache.get(key);
	}

	async set(key: string, value: string): Promise<void> {
		this.cache.set(key, value);
	}
}
