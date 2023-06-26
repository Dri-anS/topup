import { AccountRepo, AccountSchema } from "../repo";
import bcrypt from "bcryptjs";
import { login, decrypt } from "../auth";
import { z } from "zod";

export const PublicAccountSchema = AccountSchema.omit({ password: true });

export class AccountService {
	constructor(public repo: AccountRepo) {}

	static loginSchema = z.object({
		email: z.string(),
		password: z.string()
	});

	async login(data: z.infer<typeof AccountService.loginSchema>) {
		const user = await this.repo.findByEmail(data.email);
		const equal = await bcrypt.compare(data.password, user.password);
		if (!equal) {
			throw new Error("password did not match");
		}
		delete (user as any).password;
		return login(user);
	}

	async verify(token: string) {
		return decrypt(token);
	}

	async reset(email: string, old: string, newPassword: string) {
		const user = await this.repo.findByEmail(email);
		const equal = await bcrypt.compare(old, user.password);
		if (!equal) {
			throw new Error("password did not match");
		}
		const update = AccountRepo.updateSchema.parse(user);
		const salt = await bcrypt.genSalt(12);
		update.password = await bcrypt.hash(newPassword, salt);
		await this.repo.update(update);
	}

	async register(a: z.infer<typeof AccountRepo.createSchema>) {
		a = AccountRepo.createSchema.parse({ ...a, level: "NORMAL" });
		const salt = await bcrypt.genSalt(12);
		a.password = await bcrypt.hash(a.password, salt);
		const user = await this.repo.create(a);
		return login(user);
	}

	async list(page: number) {
		const accs = await this.repo.list(page);
		return PublicAccountSchema.array().parse(accs);
	}

	addBalance(email: string, change: number) {
		return this.repo.addBalance(email, change);
	}

	async update(data: z.infer<typeof AccountRepo.updateSchema>) {
		data = AccountRepo.updateSchema.parse(data);
		if (data.password) {
			const salt = await bcrypt.genSalt(12);
			data.password = (await bcrypt.hash(data.password, salt)) as any;
		}
		return this.repo.update(data);
	}
	delete(email: string) {
		return this.repo.delete(email);
	}
	async updateEmail(f: string, t: string, password: string) {
		const user = await this.repo.findByEmail(f);
		const equal = await bcrypt.compare(password, user.password);
		if (!equal) {
			throw new Error("password did not match");
		}
		return this.repo.updateEmail(f, t);
	}
}
