import { installPolyfills } from "@sveltejs/kit/node/polyfills";
if (typeof Headers === "undefined") {
	installPolyfills();
}
import { describe, it, expect } from "vitest";
import { InvoiceService } from "./invoice";
import { InvoiceRepo, InvoiceItemRepo, InvoiceSchema } from "../repo";
import { Tripay } from "../tripay";
import { MidtransPayment } from "../payment";
import { Digiflazz } from "../digiflazz";
import postgres from "postgres";
import { accountRepo } from "..";

describe("InvoiceService", () => {
	const tripay = new Tripay({
		sandbox: true,
		secret: process.env.TRIPAY_SECRET as string,
		apikey: process.env.TRIPAY_APIKEY as string,
		merchantCode: process.env.TRIPAY_MERCHANT_CODE as string
	});
	const payment = new MidtransPayment({
		sandbox: true,
		serverKey: process.env.MIDTRANS_SERVER_KEY as string,
		clientKey: process.env.MIDTRANS_CLIENT_KEY as string,
		merchantId: process.env.MIDTRANS_MERCHANT_ID as string
	});
	const d = new Digiflazz({
		webhookKey: "",
		apikey: process.env.DIGIFLAZZ_APIKEY as string,
		username: process.env.DIGIFLAZZ_USERNAME as string
	});
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

	const service = new InvoiceService(invoiceRepo, invoiceItemRepo, d, tripay, accountRepo);

	it.skip.each([{ method: "QRIS" }])("order using $method", async ({ method }) => {
		const result = await service.createTransaction({
			items: [
				{
					id: "ML-86",
					price: 10000,
					customerNo: "1"
				}
			],
			method,
			customerName: "",
			customerEmail: "",
			level: ""
		});

		expect(InvoiceSchema.parse(result)).toBeTruthy();
	});

	let stored: any;
	it("find", async () => {
		const result = await service.createTransaction({
			items: [
				{
					id: "ML-86",
					price: 10000,
					customerNo: "1"
				}
			],
			method: "QRIS",
			customerName: "",
			customerEmail: "",
			level: ""
		});
		stored = await service.find(result.id);
		expect(stored).toEqual(result);
		console.log(stored);
	});

	it("process", async () => {
		const result = await service.createTransaction({
			items: [
				{
					id: "ML-86",
					price: 10000,
					customerNo: "1"
				}
			],
			method: "QRIS",
			customerName: "",
			customerEmail: "",
			level: ""
		});
		const str = JSON.stringify({ ...stored, status: "PAID", merchant_ref: result.id });
		const sign = tripay.sign(str);
		await service.process(str, sign);
		await expect(() => service.process(str, "hhh")).rejects.toThrowError();
		console.log(await invoiceItemRepo.findByInvoiceId(result.id));
	});
}, 15e3);
