import { createHash, createHmac } from "node:crypto";
import { responseCode } from "./code";
export * from "./code";

const baseUrl = new URL("https://api.digiflazz.com/v1/");

export class DigiflazzError extends Error {
	state: string;
	constructor(code: string | number) {
		const { msg = "unknown error", state = "Gagal" } = (responseCode as any)[code.toString()] || {};
		super(msg);
		this.state = state;
	}
}

interface DigiflazzReq {
	cmd?: string;
	path: string;
	body?: Record<string, unknown>;
}

interface DigiflazzRes {
	data: unknown;
}

export interface DigiflazzOpts {
	username: string;
	apikey: string;
	webhookKey: string;
}

export interface TopupBody {
	buyer_sku_code: string;
	customer_no: string;
	ref_id: string;
	testing?: boolean;
	msg?: string;
}

export const testingCustomerNo = {
	success: "087800001230",
	failed: "087800001232",
	pendingSuccess: "087800001233",
	pendingFailed: "087800001234"
};

export class Digiflazz {
	#username: string;
	#apikey: string;
	#webhookKey: string;
	endpoint: URL;

	constructor({ apikey, username, webhookKey }: DigiflazzOpts) {
		this.#apikey = apikey;
		this.#username = username;
		this.#webhookKey = webhookKey;
		this.endpoint = baseUrl;
		if (process.env.DIGIFLAZZ_ENDPOINT) {
			this.endpoint = new URL(process.env.DIGIFLAZZ_ENDPOINT);
		}
	}

	async #req<T>({ cmd, path, body = {} }: DigiflazzReq): Promise<T> {
		body = Object.assign({}, body, {
			cmd,
			sign: this.sign((body.ref_id as string) || cmd || ""),
			username: this.#username
		});

		const url = new URL(path, this.endpoint);
		const res = await fetch(url.href, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"content-type": "application/json"
			}
		});

		const json = await res.json();
		if (!res.ok) {
			throw new DigiflazzError(json.data.rc);
		}
		if ("rc" in json.data && json.data.rc) {
			const { status } = (responseCode as any)[json.data.rc] || {};
			if (status === "Gagal") {
				throw new DigiflazzError(json.data.rc);
			}
		}
		return json.data;
	}

	sign(str: string) {
		str ||= "";
		return createHash("md5")
			.update(this.#username + this.#apikey + str)
			.digest("hex");
	}

	verify(data: unknown | string, signature: string) {
		if (typeof data !== "string") {
			data = JSON.stringify(data);
		}
		if (signature.startsWith("sha1=")) {
			signature = signature.slice(5);
		}
		return (
			signature ===
			createHmac("sha1", this.#webhookKey)
				.update(data as string)
				.digest("hex")
		);
	}

	checkDeposit() {
		return this.#req({ cmd: "depo", path: "cek-saldo" });
	}
	prices: unknown[] | null = null;
	async priceList() {
		if (this.prices?.length) {
			return this.prices;
		}
		const prices = await this.#req<unknown[]>({ path: "price-list" });
		setTimeout(() => {
			this.prices = null;
		}, 3e4);
		this.prices = prices;
		return prices;
	}

	topup(body: TopupBody) {
		return this.#req({ path: "transaction", body: body as any });
	}
}
