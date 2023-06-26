export class ConfigRepo {
	constructor(public sql: any) {}

	async load(): Promise<any> {
		const [result] = await this.sql`SELECT value FROM config ORDER BY created_at DESC limit 1`;
		return result?.value || "{}";
	}

	async save(value: any) {
		await this.sql`INSERT INTO config ${this.sql({ value })}`;
	}
}
