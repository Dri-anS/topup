import { describe, it, expect } from "vitest";
import {
	InvoiceRepo,
	InvoiceItemRepo,
	InvoiceSchema,
	InvoiceItemSchema,
	type Invoice,
	type InvoiceItem
} from "./invoice";
import postgres from "postgres";

describe("invoice repo", () => {
	const sql = postgres(process.env.DATABASE_URL as string, {
		transform: {
			undefined: null,
			...postgres.camel
		},
		ssl: {
			rejectUnauthorized: false
		}
	});
	const invoiceRepo = new InvoiceRepo(sql);
	const invoiceItemRepo = new InvoiceItemRepo(sql);
	let invoice: Invoice;

	describe("invoice", () => {
		it("create", async () => {
			const inv = InvoiceRepo.createSchema.parse({
				id: Math.random().toString(36),
				transactionId: Math.random().toString(36),
				email: "testing@a.com",
				method: "TEST",
				payStatus: "UNPAID",
				amount: 100,
				items: []
			});
			invoice = await invoiceRepo.create(inv);
			expect(InvoiceSchema.parse(invoice)).toBeTruthy();
			console.log(invoice);
		});

		it("find", async () => {
			const stored = await invoiceRepo.find(invoice.id);
			expect(InvoiceSchema.parse(invoice)).toBeTruthy();
			expect(stored).toEqual(invoice);
		});

		it("updateStatus", async () => {
			await invoiceRepo.updateStatus(invoice.id, "PAID");
			const stored = await invoiceRepo.find(invoice.id);
			expect(stored).toHaveProperty("payStatus", "PAID");
		});
	});

	let items: InvoiceItem;
	describe("invoiceItem", () => {
		it("create", async () => {
			const i = InvoiceItemRepo.createSchema.parse([
				{
					sku: "TEST",
					name: "TEST",
					price: 1000,
					priceReal: 100,
					quantity: 1,
					customerNo: "1921",
					processStatus: "PENDING",
					invoiceId: invoice.id
				}
			]);
			items = await invoiceItemRepo.create(i);
			expect(InvoiceItemSchema.required().array().parse(items)).toBeTruthy();
			expect(items.length).toBe(1);
			console.log(items);
		});

		it("findByInvoiceId", async () => {
			const stored = await invoiceItemRepo.findByInvoiceId(invoice.id);
			expect(stored).toEqual(items);
		});

		it("updateStatus", async () => {
			const toBeUpdated = items[0];
			await invoiceItemRepo.updateStatus(toBeUpdated.id, "SUCCESS");
			const [stored] = await invoiceItemRepo.findByInvoiceId(invoice.id);
			expect(stored).toHaveProperty("processStatus", "SUCCESS");
			expect(stored).toHaveProperty("id", toBeUpdated.id);
		});
	});
});
