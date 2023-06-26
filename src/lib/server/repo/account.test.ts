import { describe, it, expect } from "vitest";
import postgres from "postgres";
import { type Account, AccountRepo, AccountSchema } from "./account";

describe("account repository", () => {
	const sql = postgres(process.env.DATABASE_URL as string, {
		transform: {
			undefined: null,
			...postgres.camel
		},
		ssl: {
			rejectUnauthorized: false
		}
	});
	const accountRepo = new AccountRepo(sql);
	let account: Account;

	it("create", async () => {
		const data = AccountRepo.createSchema.parse({
			email: Math.random().toString().slice(2) + "@test.ing",
			password: "$2a$10$50EpXjF3sMHLwzWpAz/UEujOzjWwS6n8LIwnM3O./msaaqkeBC8M.",
			phone: "62" + ((Math.random() * 1e8) | 0).toString(),
			name: "testing"
		});

		account = await accountRepo.create(data);
		console.log(account);
		expect(AccountSchema.parse(account)).toHaveProperty("id", expect.any(Number));
	});

	it("find", async () => {
		const stored = await accountRepo.findByEmail(account.email);
		expect(stored).toEqual(account);
	});

	it("find not existing data", async () => {
		await expect(() => accountRepo.findByEmail("account.email@g.com")).rejects.toThrowError(
			/not found/gi
		);
	});

	it("update", async () => {
		await accountRepo.update({
			email: account.email,
			level: "ADMIN"
		});

		const stored = await accountRepo.findByEmail(account.email);
		expect(stored).not.toEqual(account);
		expect(stored).toHaveProperty("level", "ADMIN");
	});
});
