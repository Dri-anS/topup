import { z } from "zod";
import type { Account } from "./account";
export const PayStatusEnum = z.enum(["UNPAID", "PAID", "EXPIRED", "FAILED", "REFUND"]);

export type PayStatus = z.infer<typeof PayStatusEnum>;

export const ProcessStatusEnum = z.enum(["CREATED", "PENDING", "SUCCESS", "FAILED", "RECREATED"]);

export type ProcessStatus = z.infer<typeof ProcessStatusEnum>;

export const InvoiceItemSchema = z.object({
	id: z.number().default(-1), // digiflazz merchant ref = tripay merchant ref + "-" + invoice item id
	invoiceId: z.string(),
	sku: z.string(),
	name: z.string(),
	brand: z.string().nullable().default(null),
	category: z.string().nullable().default(null),
	price: z.number().positive(), // required by tripay
	priceReal: z.number().positive(),
	quantity: z.number().refine((i) => i === 1, "quantity must be 1"), // required by tripay
	customerNo: z.string(), // userId + zoneId for game or phone number for pulsa,
	processStatus: ProcessStatusEnum.default("CREATED"),

	error: z.string().nullable().default(null),
	sn: z.string().nullable().default(null), // digiflazz sn
	tele: z.string().nullable().default(null), // digiflazz seller tele
	wa: z.string().nullable().default(null), // digiflazz seller wa

	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date())
});

export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;

export const InvoiceSchema = z.object({
	id: z.string(), // tripay merchant ref
	transactionId: z.string(),
	method: z.string(),
	// identity
	email: z.string().email(), // required by tripay
	phone: z.string().nullable().default(null),
	telegram: z.string().nullable().default(null),

	payStatus: PayStatusEnum.default("UNPAID"),
	amount: z.number().positive(),

	items: z.array(InvoiceItemSchema).default(() => []),

	payCode: z.string().nullable().default(null),

	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date())
});

export type Invoice = z.infer<typeof InvoiceSchema>;

export class InvoiceRepo {
	constructor(public sql: any) {}

	static createSchema = InvoiceSchema.pick({
		id: true,
		transactionId: true,
		method: true,
		email: true,
		phone: true,
		telegram: true,
		payStatus: true,
		amount: true,
		items: true,
		payCode: true
	});

	async create(invoice: z.infer<typeof InvoiceRepo.createSchema>): Promise<Invoice> {
		const [result] = await this.sql<Invoice[]>`
			INSERT INTO invoice ${this.sql(
				invoice,
				"id",
				"transactionId",
				"method",
				"email",
				"phone",
				"telegram",
				"payStatus",
				"amount",
				"payCode"
			)} RETURNING *
		`;

		return InvoiceSchema.parseAsync(result);
	}

	async list(page: number) {
		const limit = 10;
		const offset = limit * page - limit;
		const results = await this.sql<Account[]>`
			SELECT 
				* 
			FROM 
				invoice
			ORDER BY
				updated_at DESC
			LIMIT 
				${limit}
			OFFSET
				${offset}
		`;
		return results;
	}

	async find(id: string) {
		const [result] = await this.sql<Invoice[]>`
			SELECT * FROM invoice WHERE ID = ${id} LIMIT 1
		`;
		if (!result) {
			throw new Error("invoice not found");
		}

		return InvoiceSchema.parseAsync(result);
	}

	async updateStatus(id: string, status: PayStatus) {
		await this.sql`
			UPDATE invoice
			SET pay_status = ${status}, updated_at = CURRENT_TIMESTAMP
			WHERE id = ${id}
		`;
	}
}

export interface ProfitAnalytic {
	day: Date;
	profit: number;
}

export class InvoiceItemRepo {
	constructor(public sql: any) {}

	static createSchema = InvoiceItemSchema.pick({
		invoiceId: true,
		sku: true,
		name: true,
		brand: true,
		category: true,
		price: true,
		priceReal: true,
		quantity: true,
		customerNo: true,
		error: true,
		sn: true,
		tele: true,
		wa: true
	}).array();

	async create(items: z.infer<typeof InvoiceItemRepo.createSchema>) {
		const results = await this.sql<InvoiceItem[]>`
			INSERT INTO invoice_item ${this.sql(
				items,
				"invoiceId",
				"sku",
				"name",
				"brand",
				"category",
				"price",
				"priceReal",
				"quantity",
				"customerNo",
				"error",
				"sn",
				"tele",
				"wa"
			)} RETURNING *
		`;
		return InvoiceItemSchema.required().array().parseAsync(results);
	}

	async findByInvoiceId(invoiceId: string, status?: string) {
		const s = status;
		const results = await this.sql<InvoiceItem[]>`
			SELECT * FROM invoice_item WHERE invoice_id = ${invoiceId}
		`;

		return InvoiceItemSchema.required()
			.array()
			.parseAsync(results)
			.then((items) => items.filter((item) => !status || item.processStatus === status));
	}

	async updateStatus(id: number, status: ProcessStatus) {
		await this.sql`
			UPDATE invoice_item
			SET process_status = ${status}, updated_at = CURRENT_TIMESTAMP
			WHERE id = ${id}
		`;
	}

	static updateSchema = InvoiceItemSchema.pick({
		id: true,
		priceReal: true,
		processStatus: true,
		error: true,
		sn: true,
		tele: true,
		wa: true
	});

	async update(data: z.infer<typeof InvoiceItemRepo.updateSchema>) {
		await this.sql`
			UPDATE invoice_item
			SET 
				price_real = COALESCE(${data.priceReal}, price_real), 
				process_status = COALESCE(${data.processStatus}, process_status), 
				error = COALESCE(${data.error}, error), 
				sn = COALESCE(${data.sn}, sn), 
				wa = COALESCE(${data.wa}, wa), 
				tele = COALESCE(${data.tele}, tele), 
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ${data.id}
		`;
	}

	analytic() {
		return this.sql<ProfitAnalytic[]>`
			SELECT 
				days.day as day, 
				COALESCE(SUM(invoice_item.price - invoice_item.price_real), 0) AS profit 
			FROM GENERATE_SERIES(
				current_date - interval '30 days', 
				current_date, 
				'1 day'
			) AS days(day) 
			LEFT JOIN 
				invoice_item 
			ON (
				days.day = invoice_item.created_at::DATE AND 
				invoice_item.process_status in ('PENDING', 'SUCCESS')
			) 
			GROUP BY days.day ORDER BY days.day;
		`;
	}
}
