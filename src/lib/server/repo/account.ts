import { z } from "zod";

export const AccountLevelEnum = z.enum(["NORMAL", "RESELLER", "ADMIN"]);

export type AccountLevel = z.infer<typeof AccountLevelEnum>;

export const AccountSchema = z.object({
	id: z.coerce.number(),
	email: z.string().email(),
	phone: z.string(),
	telegram: z.string().nullable().default(null),
	password: z.string(),
	name: z.string(),
	level: AccountLevelEnum.default("NORMAL"),
	balance: z.coerce.number().default(0),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date())
});

export type Account = z.infer<typeof AccountSchema>;

export class AccountRepo {
	constructor(public sql: any) { }

	async findByEmail(email: string) {
		const [result] = await this.sql<Account[]>`
			SELECT * FROM account WHERE email = ${email} LIMIT 1
		`;
		if (!result) {
			throw new Error("account not found");
		}

		return AccountSchema.parse(result);
	}

	static createSchema = AccountSchema.pick({
		email: true,
		phone: true,
		telegram: true,
		password: true,
		name: true,
		level: true
	});

	async create(data: z.infer<typeof AccountRepo.createSchema>) {
		const [result] = await this.sql<Account[]>`
			INSERT INTO account ${this.sql(
			data,
			"email",
			"phone",
			"telegram",
			"password",
			"name",
			"level"
		)} RETURNING *
		`;

		return AccountSchema.parse(result);
	}

	static updateSchema = AccountSchema.pick({
		email: true,
		telegram: true,
		password: true,
		name: true,
		balance: true,
		level: true
	}).partial();

	async update(data: z.infer<typeof AccountRepo.updateSchema>) {
		await this.sql<Account[]>`
			UPDATE account
			SET 
				telegram = COALESCE(${data.telegram}, telegram),
				password = COALESCE(${data.password}, password),
				name = COALESCE(${data.name}, name),
				balance = COALESCE(${data.balance}, balance),
				level = COALESCE(${data.level}, level)
			WHERE
			 	email = ${data.email}
		`;
	}

	async updateEmail(f: string, t: string) {
		await this.sql`
			UPDATE account
			SET
				email = ${t}
			WHERE
				email = ${f} 
		`;
	}

	async list(page: number) {
		const limit = 10;
		const offset = limit * page - limit;
		const results = await this.sql<Account[]>`
			SELECT 
				* 
			FROM 
				account
			ORDER BY
				created_at DESC
			LIMIT 
				${limit}
			OFFSET
				${offset}
		`;
		return results;
	}

	addBalance(email: string, change: number) {
		return this.sql.begin(async (sql: any) => {
			const [account] = await sql`
				SELECT * FROM account WHERE email = ${email} FOR UPDATE
			`;
			if (!account) {
				return null;
			}

			const balance = account.balance + change;
			if (balance < 0) {
				return null;
			}

			const [updated] = await sql`
				UPDATE account SET balance = ${balance}	WHERE email = ${email} RETURNING *
			`;
			return updated;
		});
	}

	async delete(email: string) {
		const [result] = await this.sql<Account[]>`
			DELETE FROM account WHERE email = ${email} RETURNING *
		`;
		return result;
	}
}
