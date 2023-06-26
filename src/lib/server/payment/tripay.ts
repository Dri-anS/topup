import { TripayError } from "../tripay";
import { Payment, PaymentError, type Channel, type Transaction, TransactionSchema } from "./base";
import { createHmac } from "node:crypto";

export interface TripayPaymentOptions {
	sandbox?: boolean;
	secret: string;
	apikey: string;
	merchantCode: string;
}

const productionUrl = "https://tripay.co.id/api/";
const sandboxUrl = "https://tripay.co.id/api-sandbox/";

export class TripayPayment extends Payment {
	readonly name = "tripay";
	sandbox?: boolean;
	secret: string;
	apikey: string;
	merchantCode: string;
	endpoint: URL;

	constructor(opts: TripayPaymentOptions) {
		super();
		this.sandbox = opts.sandbox ?? true;
		this.secret = opts.secret;
		this.apikey = opts.apikey;
		this.merchantCode = opts.merchantCode;
		this.endpoint = new URL(opts.sandbox ? sandboxUrl : productionUrl);
		if (process.env.TRIPAY_ENDPOINT) {
			this.endpoint = new URL(process.env.TRIPAY_ENDPOINT);
		}
	}

	private async fetch<T = any>(
		method: string,
		path: string,
		body: Record<string, any> = {},
		init: RequestInit = {}
	): Promise<T> {
		init.method = method;
		const h = (init.headers = new Headers(init.headers || {}));
		h.set("Authorization", `Bearer ${this.apikey}`);

		const url = new URL(path, this.endpoint);
		if (method === "GET") {
			for (const [k, v] of Object.entries(body)) {
				url.searchParams.set(k, v);
			}
		} else {
			init.body = JSON.stringify(body);
			h.set("content-type", "application/json");
		}

		const response = await fetch(url.href, init);
		const result = (await response.json()) as any;
		if (!response.ok || !result.success) {
			if (!result.message) {
				result.message = "unknown error occured";
				console.error(result);
			}
			throw new PaymentError(result.message);
		}

		return result.data;
	}

	private sign(s: string) {
		return createHmac("sha256", this.secret).update(s).digest("hex");
	}

	private verify(data: string | unknown, signature: string) {
		if (typeof data !== "string") {
			data = JSON.stringify(data);
		}
		if (this.sign(data as string) === signature) {
			return JSON.parse(data as string);
		}
		throw new PaymentError("invalid signature");
	}

	async verifyCallback(req: Request) {
		const text = await req.text();
		const signature = req.headers.get("x-callback-signature");
		if (!signature) {
			throw new TripayError("missing callback signature");
		}
		const data = this.verify(text, signature);
		return {
			id: data.merchant_ref,
			paymentMethod: data.payment_method,
			transactionId: data.reference,
			transactionStatus: data.status
		};
	}

	async createTransaction(t: Transaction) {
		const tx = TransactionSchema.parse(t);
		const body: Record<string, any> = {
			method: tx.paymentMethod,
			merchant_ref: tx.id,
			amount: 0,
			customer_name: tx.customerName || "Tamu",
			customer_email: tx.customerEmail || "pelanggan@top.up",
			customer_phone: tx.customerPhone
		};
		body.order_items = tx.items.map((item) => {
			body.amount += item.price;
			return {
				sku: item.id,
				name: item.name,
				price: item.price,
				quantity: 1
			};
		});
		body.signature = this.sign(this.merchantCode + body.merchant_ref + body.amount);
		const res = await this.fetch("POST", "transaction/create", body);
		return {
			...tx,
			amount: res.amount,
			transactionId: res.reference,
			transactionStatus: res.status,
			paymentCode: res.pay_url ?? res.pay_code ?? res.qr_url
		};
	}

	async getChannels() {
		const channels = await this.fetch("GET", "merchant/payment-channel");
		return channels.map((c: any) => ({
			code: c.code,
			name: c.name,
			group: c.group,
			feePercent: parseFloat(c.fee_customer.percent.toString()),
			feeFlat: parseInt(c.fee_customer.flat.toString())
		}));
	}
}
