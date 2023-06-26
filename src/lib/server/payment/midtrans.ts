import type { TransactionWebhook } from "./base";
import { Payment, PaymentError, type Channel, type Transaction, TransactionSchema } from "./base";

export class MidtransError extends PaymentError {}

export interface MidtransOptions {
	sandbox?: boolean;
	serverKey: string;
	clientKey: string;
	merchantId: string;
	endpoint?: string;
	channels?: string;
}

const midtransChannel: Channel[] = [
	{
		code: "gopay",
		name: "Gopay",
		group: "E-Wallet",
		feePercent: 10,
		feeFlat: 0
	},
	{
		code: "qris",
		name: "QRIS",
		group: "E-Wallet",
		feePercent: 0.7,
		feeFlat: 0
	},
	{
		code: "other_qris",
		name: "QRIS 2",
		group: "E-Wallet",
		feePercent: 0.7,
		feeFlat: 0
	},
	{
		code: "shopeepay",
		name: "ShopeePay",
		group: "E-Wallet",
		feePercent: 4,
		feeFlat: 0
	}
];

export class MidtransPayment extends Payment {
	readonly name = "midtrans";
	sandbox: boolean;
	serverKey: string;
	clientKey: string;
	merchantId: string;
	endpoint: URL;
	channels: string[];
	snap: URL = new URL("https://foo/");
	constructor(opts: MidtransOptions) {
		super();
		this.sandbox = opts.sandbox ?? false;
		this.serverKey = opts.serverKey;
		this.clientKey = opts.clientKey;
		this.merchantId = opts.merchantId;
		this.channels = opts.channels?.split(",") || [];
		if (opts.endpoint) {
			this.endpoint = new URL(opts.endpoint);
		} else if (opts.sandbox) {
			this.endpoint = new URL("https://api.sandbox.midtrans.com");
			this.snap = new URL("https://app.sandbox.midtrans.com");
		} else {
			this.endpoint = new URL("https://api.midtrans.com");
			this.snap = new URL("https://app.midtrans.com");
		}
	}

	private async request<T>(
		path: string,
		init: RequestInit,
		body?: unknown,
		retry = -1
	): Promise<T> {
		if (body) {
			init.body = JSON.stringify(body);
		}
		const authorization = `Basic ${btoa(this.serverKey + ":")}`;
		const h = (init.headers = new Headers(init.headers));
		h.set("Authorization", authorization);
		h.set("content-type", "application/json");
		h.set("accept", "application/json");
		let url = new URL(path, this.endpoint);
		if (path.includes("snap")) {
			url = new URL(path, this.snap);
		}
		const res = await fetch(url.href, init);
		if (!res.ok) {
			const text = await res.text();
			const { message, status_message } = this.parseSafe(text);
			throw new MidtransError(
				"received non 2xx status code: " +
					res.status +
					", with message: " +
					(message || status_message || "unknown error")
			);
		}

		return res.json() as Promise<T>;
	}

	private parseSafe(s: string) {
		try {
			return JSON.parse(s);
		} catch {
			console.error(s);
			return {};
		}
	}

	getChannels() {
		const channels = midtransChannel.filter(
			(i) => this.channels.includes(i.code) || !this.channels.length
		);
		return Promise.resolve(channels);
	}

	async verifyCallback(req: Request) {
		const body = await req.json();
		return {
			id: body.order_id,
			paymentMethod: body.payment_type,
			transactionId: body.transaction_id,
			transactionStatus: this.txStatus(body.transaction_status, body.payment_type)
		} as TransactionWebhook;
	}

	private txStatus(s: string, p: string) {
		switch (s) {
			case "capture":
			case "settlement":
				return "PAID";

			case "authorize":
			case "pending":
				return "PENDING";

			case "deny":
			case "cancel":
			case "expire":
				return "FAILED";

			case "refund":
			case "partial_refund":
				return "REFUND";

			default:
				throw new MidtransError("unknown transaction status: " + s);
		}
	}

	async createTransaction(t: Transaction) {
		const tx = TransactionSchema.parse(t);
		const body: Record<string, any> = {
			transaction_details: {
				order_id: tx.id,
				gross_amount: tx.amount
			},
			item_details: [],
			customer_details: {
				first_name: tx.customerName,
				last_name: "",
				email: tx.customerEmail,
				phone: tx.customerPhone
			}
		};
		let amount = 0;
		tx.items?.forEach((item) => {
			const price = Math.ceil(item.price);
			amount += price;
			body.item_details.push({
				id: item.id,
				name: item.name,
				quantity: 1,
				price
			});
		});
		tx.paymentMethod = tx.paymentMethod.toLowerCase();
		if (tx.paymentMethod === "other_qris") {
			return this.chargeOtherQris(tx, body);
		}
		if (tx.paymentMethod === "qris") {
			return this.chargeQris(tx, body);
		}
		if (tx.paymentMethod === "gopay") {
			return this.chargeGopay(tx, body);
		}
		throw new MidtransError("unknown payment method: " + tx.paymentMethod);
	}

	private addPaymentFee(body: Record<string, any>) {
		const payment = midtransChannel.find(
			(i) => i.code === body.payment_type || i.code === body.enabled_payments?.[0]
		);
		if (!payment) {
			throw new MidtransError(
				"unknown payment type: " + body.payment_type || body.enabled_payments[0]
			);
		}
		let fee = Math.ceil((body.transaction_details.gross_amount * payment.feePercent) / 100);
		fee += payment.feeFlat;
		body.transaction_details.gross_amount += fee;
		body.item_details.push({
			id: `${payment.code.toUpperCase()}-FEE`,
			name: `${payment.name} Fee`,
			quantity: 1,
			price: fee
		});
	}

	private calculateGross(body: Record<string, any>) {
		body.transaction_details.gross_amount = 0;
		body.item_details.forEach((i: any) => {
			body.transaction_details.gross_amount += Math.ceil(i.price);
		});
	}

	private refineChargeResponse(responseBody: any, tx: Transaction): Transaction {
		return {
			...tx,
			transactionId: responseBody.transaction_id,
			amount: parseInt(responseBody.gross_amount),
			transactionStatus: "UNPAID"
		};
	}

	private async chargeOtherQris(tx: any, body: Record<string, any>) {
		body.enabled_payments = ["other_qris"];
		this.calculateGross(body);
		this.addPaymentFee(body);
		tx.items = body.item_details.slice();
		const responseBody = await this.request("/snap/v1/transactions", { method: "POST" }, body);
		return {
			...tx,
			paymentMethod: "snap",
			amount: body.transaction_details.gross_amount,
			transactionId: (responseBody as any).token,
			paymentCode: (responseBody as any).token,
			transactionStatus: "UNPAID"
		} as Transaction;
	}

	private async chargeQris(tx: any, body: Record<string, any>) {
		body.payment_type = "qris";
		body.qris = {
			acquirer: "gopay"
		};
		this.calculateGross(body);
		this.addPaymentFee(body);
		tx.items = body.item_details.slice();
		const responseBody = await this.request("/v2/charge", { method: "POST" }, body);
		return {
			...this.refineChargeResponse(responseBody, tx),
			paymentCode: (responseBody as any).actions[0].url
		} as Transaction;
	}

	private async chargeGopay(tx: any, body: Record<string, any>) {
		body.payment_type = "gopay";
		body.gopay = {
			enable_callback: !!tx.callbackUrl,
			callback_url: tx.callbackUrl
		};
		this.calculateGross(body);
		this.addPaymentFee(body);
		tx.items = body.item_details.slice();
		const responseBody = await this.request("/v2/charge", { method: "POST" }, body);
		return {
			...this.refineChargeResponse(responseBody, tx),
			paymentCode: (responseBody as any).actions[1].url
		} as Transaction;
	}
}
