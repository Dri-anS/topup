import {
	InvoiceItemRepo,
	InvoiceRepo,
	AccountRepo,
	InvoiceSchema,
	InvoiceItemSchema
} from "../repo";
import type { Digiflazz } from "../digiflazz";
import { Tripay, channel, type ChannelCode } from "../tripay";
import { topupId, invDigiflazz } from "../nanoid";
import { z } from "zod";
import { config } from "../config";
import type { Payment } from "../payment";
import { calculatePrice } from "../../pmap";

export const TripayChannelEnum = z.enum(Array.from(Object.keys(channel)) as any);

export class InvoiceService {
	constructor(
		public invoiceRepo: InvoiceRepo,
		public invoiceItemRepo: InvoiceItemRepo,
		public digiflazz: Digiflazz,
		public payment: Payment,
		public accountRepo: AccountRepo
	) {}

	analytic() {
		return this.invoiceItemRepo.analytic();
	}

	static createTransactionSchema = z.object({
		items: z
			.object({
				id: z.string().refine((s) => s.toUpperCase()),
				price: z.coerce.number().optional().default(0),
				customerNo: z.string()
			})
			.array(),
		customerName: z.string().default(() => "guest"),
		customerEmail: z
			.string()
			.email()
			.default(() => "guest@topup.com"),
		customerPhone: z.string().optional(),
		customerTelegram: z.string().optional(),
		method: z.string(),
		callbackUrl: z.string().optional(),
		level: z.string().default("NORMAL")
	});

	async createTransaction(tx: z.infer<typeof InvoiceService.createTransactionSchema>) {
		tx = InvoiceService.createTransactionSchema.parse(tx);
		const id = await topupId();
		const prices = await this.digiflazz
			.priceList()
			.then((prices: any) =>
				prices.filter((p: any) => p.buyer_product_status && p.seller_product_status)
			);
		tx.items.forEach((item: any) => {
			if (item.id === "DEPOSIT") {
				item.priceReal = item.price;
				item.name = "Deposit saldo member";
				item.brand = "DEPOSIT";
				item.category = "Member";
				item.invoiceId = id;
				item.quantity = 1;
				return;
			}
			const p = prices.find((p: any) => p.buyer_sku_code === item.id);
			if (!p) {
				throw new Error("unknown product: " + item.id);
			}

			item.quantity = 1;
			item.price = calculatePrice(config, p.price, p.category, tx.level);
			item.priceReal = p.price;
			item.invoiceId = id;
			item.id = p.buyer_sku_code;
			item.name = p.product_name;
			item.brand = p.brand;
			item.category = p.category;
		});
		const transaction = await this.payment.createTransaction({
			id,
			amount: 1,
			customerName: tx.customerName,
			customerEmail: tx.customerEmail,
			customerPhone: tx.customerPhone,
			callbackUrl: tx.callbackUrl,
			paymentMethod: tx.method,
			items: tx.items.map((i) => ({ ...i, quantity: 1 }))
		});
		const invoice = InvoiceRepo.createSchema.parse({
			id,
			transactionId: transaction.transactionId || "",
			method: transaction.paymentMethod,
			email: tx.customerEmail,
			name: tx.customerName,
			phone: tx.customerPhone,
			telegram: tx.customerTelegram,
			amount: transaction.amount,
			payCode: transaction.paymentCode,
			items: tx.items.map((item) => {
				return {
					...item,
					id: 0,
					sku: item.id,
					invoiceId: id
				};
			})
		});
		const created = await this.invoiceRepo.create(invoice);
		created.items = await this.invoiceItemRepo.create(invoice.items);
		return InvoiceSchema.parse(created);
	}

	static balanceTransactionSchema = z.object({
		items: z
			.object({
				id: z.string().refine((s) => s.toUpperCase()),
				customerNo: z.string(),
				price: z.number()
			})
			.array(),
		customerName: z.string().default(() => "guest"),
		customerEmail: z
			.string()
			.email()
			.default(() => "guest@topup.com"),
		customerPhone: z.string().optional(),
		customerTelegram: z.string().optional(),
		level: z.string().default("NORMAL")
	});

	async balanceTransaction(tx: z.infer<typeof InvoiceService.balanceTransactionSchema>) {
		tx = InvoiceService.balanceTransactionSchema.parse(tx);
		const id = await topupId();
		let amount = 0;
		const prices = await this.digiflazz
			.priceList()
			.then((prices: any) =>
				prices.filter((p: any) => p.buyer_product_status && p.seller_product_status)
			);
		tx.items.forEach((item: any) => {
			if (item.id === "DEPOSIT") {
				item.priceReal = item.price;
				item.name = "Deposit saldo member";
				item.brand = "DEPOSIT";
				item.category = "Member";
				item.invoiceId = id;
				item.quantity = 1;
				amount += item.price;
				return;
			}
			const p = prices.find((p: any) => p.buyer_sku_code === item.id);
			if (!p) {
				throw new Error("unknown product: " + item.id);
			}

			item.quantity = 1;
			item.price = calculatePrice(config, p.price, p.category, tx.level);
			amount += item.price;
			item.priceReal = p.price;
			item.invoiceId = id;
			item.id = p.buyer_sku_code;
			item.name = p.product_name;
			item.brand = p.brand;
			item.category = p.category;
		});

		const invoice = InvoiceRepo.createSchema.parse({
			id,
			transactionId: "-",
			method: "BALANCE",
			email: tx.customerEmail,
			phone: tx.customerPhone,
			telegram: tx.customerTelegram,
			payStatus: "UNPAID",
			amount,
			items: tx.items.map((item) => {
				return {
					...item,
					id: 0,
					sku: item.id,
					invoiceId: id
				};
			})
		});
		const created = await this.invoiceRepo.create(invoice);
		created.items = await this.invoiceItemRepo.create(invoice.items);
		return InvoiceSchema.parse(created);
	}

	static updateTransactionSchema = z.object({
		id: z.string(),
		transactionId: z.string(),
		transactionStatus: z.string()
	});

	async updateTransaction(t: z.infer<typeof InvoiceService.updateTransactionSchema>) {
		const tx = InvoiceService.updateTransactionSchema.parse(t);
		tx.transactionStatus = tx.transactionStatus.toUpperCase();
		if (tx.transactionStatus === "PENDING") {
			return;
		}
		await this.invoiceRepo.updateStatus(tx.id, tx.transactionStatus as any);
		if (tx.transactionStatus !== "PAID") {
			return;
		}
		const items = await this.invoiceItemRepo.findByInvoiceId(tx.id, "CREATED");
		const pending = items.map(async (item) => {
			const id = invDigiflazz(tx.id, item.id);
			try {
				if (item.sku === "DEPOSIT") {
					await this.accountRepo.addBalance(item.customerNo, item.price);
					item.processStatus = "SUCCESS";
					item.id = id as any;
					item.wa = "-";
					item.tele = "-";
					return;
				}
				await this.invoiceItemRepo.update({
					id: item.id,
					processStatus: "PENDING"
				} as any);
				const result = (await this.digiflazz.topup({
					customer_no: item.customerNo,
					buyer_sku_code: item.sku,
					ref_id: id
				})) as any;
				const q = {
					id: item.id,
					processStatus: result.status === "Sukses" ? "SUCCESS" : "PENDING",
					wa: result.wa,
					tele: result.tele
				};
				Object.assign(item, q);
				await this.invoiceItemRepo.update(q as any).catch((e) => console.error(e));
			} catch (e: any) {
				const q = {
					id: item.id,
					processStatus: "FAILED",
					error: e.message || "unknown error"
				};
				Object.assign(item, q);
				await this.invoiceItemRepo.update(q as any).catch((e) => console.error(e));
			}
		});
		await Promise.allSettled(pending);
		return items;
	}

	static updateItemSchema = z.object({
		id: z.string(),
		processStatus: z.string(),
		sn: z.string().optional(),
		error: z.string().optional()
	});

	async updateItem(data: z.infer<typeof InvoiceService.updateItemSchema>) {
		data = InvoiceService.updateItemSchema.parse(data);
		const id = +(data.id.split("-")[2] || "");
		await this.invoiceItemRepo.update({
			id,
			processStatus: data.processStatus,
			sn: data.sn,
			error: data.error
		} as any);
	}

	static orderSchema = z.object({
		tx: z.object({
			customerName: z.string().default(() => "guest"),
			method: TripayChannelEnum,
			callbackUrl: z.string().url().optional(),
			returnUrl: z.string().url().optional(),
			expiredTime: z.number().optional()
		}),
		invoice: InvoiceRepo.createSchema
			.omit({
				id: true,
				transactionId: true,
				method: true,
				payStatus: true,
				payCode: true,
				qrUrl: true,
				items: true,
				expiredAt: true
			})
			.merge(
				z.object({
					items: InvoiceItemSchema.pick({
						sku: true,
						customerNo: true
					}).array()
				})
			),
		level: z.string().optional()
	});

	async find(id: string) {
		const invoice = await this.invoiceRepo.find(id);
		invoice.items = await this.invoiceItemRepo.findByInvoiceId(id);
		return InvoiceSchema.parse(invoice);
	}

	async list(page: number) {
		const invoices = await this.invoiceRepo.list(page);
		const pending = invoices.map(async (i: any) => {
			i.items = await this.invoiceItemRepo.findByInvoiceId(i.id);
			return i;
		});
		return Promise.all(pending);
	}
}
