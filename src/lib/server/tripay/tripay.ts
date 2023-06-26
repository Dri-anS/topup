// @ts-nocheck

const productionUrl = "https://tripay.co.id/api/";
const sandboxUrl = "https://tripay.co.id/api-sandbox/";

import { createHmac } from "node:crypto";
import { fetch, ProxyAgent } from "undici";

export type TripayResponse<Data extends Record<string, any>> = {
	success: boolean;
	message: string;
	data: Data;
};

export const channel = {
	MYBVA: "Maybank Virtual Account",
	PERMATAVA: "Permata Virtual Account",
	BNIVA: "BNI Virtual Account",
	BRIVA: "BRI Virtual Account",
	MANDIRIVA: "Mandiri Virtual Account",
	BCAVA: "BCA Virtual Account",
	SMSVA: "Sinarmas Virtual Account",
	MUAMALATVA: "Muamalat Virtual Account",
	CIMBVA: "CIMB Niaga Virtual Account",
	BSIVA: "BSI Virtual Account",
	OCBCVA: "OCBC NISP Virtual Account",
	DANAMONVA: "Danamon Virtual Account",
	BNCVA: "BNC Virtual Account",
	BSIVAOP: "BSI Virtual Account(Open Payment)",
	ALFAMART: "Alfamart",
	INDOMARET: "Indomaret",
	ALFAMIDI: "Alfamidi",
	OVO: "OVO",
	QRIS: "QRIS by ShopeePay",
	QRISC: "QRIS Customizeable",
	QRIS2: "QRIS",
	QRIS_DANA: "QRIS custom by Dana",
	QRIS_SHOPEEPAY: "QRIS custom by ShopeePay",
	SHOPEEPAY: "ShopeePay"
} as const;

export type ChannelCode = Extract<keyof typeof channel, string>;

export class TripayError extends Error {}

export interface PaymentInstructionQuery {
	code: ChannelCode;
	pay_code?: string;
	amount?: string;
	allow_html?: number;
}

export interface PaymentInstruction {
	title: string;
	steps: string[];
}

export type PaymentChannelResult = {
	group: string;
	code: ChannelCode;
	name: string;
	type: string;
	fee_merchant: {
		flat: number;
		percent: number;
	};
	fee_customer: {
		flat: number;
		percent: number;
	};
	total_fee: {
		flat: number;
		percent: string;
	};
	minimum_fee: number;
	maximum_fee: number;
	icon_url: string;
	active: boolean;
}[];

export type OrderItem<T extends Record<string, unknown> = {}> = T & {
	name: string;
	price: number;
	quantity: number;
};

export type ClosedTxDetail<T = {}> = {
	reference: string;
	merchant_ref?: string;
	payment_selection_type: string;
	payment_method: ChannelCode;
	payment_name: string;
	customer_name: string;
	customer_email: string;
	customer_phone?: string;
	callback_url?: string;
	return_url?: string;
	amount: number;
	fee_merchant: number;
	fee_customer: number;
	total_fee: number;
	amount_received: number;
	pay_code: string;
	pay_url?: string;
	checkout_url: string;
	status: string;
	expired_time: number;
	order_items: OrderItem<T>[];
	payment_instruction: PaymentInstruction[];
	qr_string?: string;
	qr_url?: string;
	created_at?: number;
	expired_at?: number;
	paid_at?: number;
};

export type ClosedTxRequest<T = {}> = {
	method: ChannelCode;
	merchant_ref?: string;
	amount: number;
	customer_name: string;
	customer_email: string;
	customer_phone?: string;
	order_items: OrderItem<T>[];
	callback_url?: string;
	return_url?: string;
	expired_time?: number;
	signature?: string;
};

export interface TripayOpts {
	sandbox?: boolean;
	secret: string;
	apikey: string;
	merchantCode: string;
}

export class Tripay<Item = {}> {
	#secret: string;
	#apikey: string;
	#merchantCode: string;
	endpoint: URL;

	constructor({ sandbox = true, secret, apikey, merchantCode }: TripayOpts) {
		if (!secret) {
			throw new TripayError("secret is required");
		}
		if (!apikey) {
			throw new TripayError("apikey is required");
		}
		if (!merchantCode) {
			throw new TripayError("merchantCode is required");
		}
		this.#secret = secret;
		this.#apikey = apikey;
		this.#merchantCode = merchantCode;
		this.endpoint = new URL(sandbox ? sandboxUrl : productionUrl);
		if (process.env.TRIPAY_ENDPOINT) {
			this.endpoint = new URL(process.env.TRIPAY_ENDPOINT);
		}
	}

	async #fetch<T = any>(
		method: string,
		path: string,
		body: Record<string, any> = {},
		init: RequestInit = {}
	): Promise<T> {
		init.method = method;
		const h = (init.headers = new Headers(init.headers || {}));
		h.set("Authorization", `Bearer ${this.#apikey}`);

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
		const result = (await response.json()) as TripayResponse;
		if (!response.ok || !result.success) {
			if (!result.message) {
				result.message = "unknown error occured";
				console.error(result);
			}
			throw new TripayError(result.message);
		}

		return result.data;
	}

	sign(s: string) {
		return createHmac("sha256", this.#secret).update(s).digest("hex");
	}

	verify(data: string | unknown, signature: string) {
		if (typeof data !== "string") {
			data = JSON.stringify(data);
		}
		return this.sign(data) === signature;
	}

	parse(data: string | unknown, signature: string) {
		if (!this.verify(data, signature)) {
			throw new TripayError("invalid signature");
		}
		if (typeof data === "string") {
			return JSON.parse(data) as ClosedTxDetail<Item>;
		}
		return data as ClosedTxDetail<Item>;
	}

	paymentInstruction(q: PaymentInstructionQuery) {
		return this.#fetch<PaymentInstruction[]>("GET", "payment/instruction", q);
	}

	paymentChannel() {
		return this.#fetch<PaymentChannelResult>("GET", "merchant/payment-channel");
	}

	closedTx(r: ClosedTxRequest<Item>) {
		r.signature = this.sign(this.#merchantCode + r.merchant_ref + r.amount);
		return this.#fetch<ClosedTxDetail>("POST", "transaction/create", r).then((r) => {
			r.expired_at *= 1e3;
			return r;
		});
	}

	closedTxDetail(reference: string) {
		return this.#fetch<ClosedTxDetail>("GET", "transaction/detail", { reference }).then((r) => {
			r.expired_at *= 1e3;
			return r;
		});
	}
}
