export * from "./config";
export * from "./tripay";
export * from "./nanoid";
export * from "./repo";
export * from "./service";

import { env } from "$env/dynamic/private";
import { building } from "$app/environment";
function init<T>(fn: () => T): T {
	if (building) {
		return null as any;
	}
	return fn();
}

import { createHmac, pbkdf2Sync } from "node:crypto";
import hkdf from "@panva/hkdf";
export const secrets = await init(async () => {
	const month = (new Date().getTime() / 86400 / 30) | 0;
	const salt = await hkdf("sha512", env.DATABASE_URL as string, env.JWT_SECRET as string, "", 16);
	const currentJwt = await hkdf(
		"sha512",
		`${month} this is the most secrets thing !!!`,
		salt,
		"JWT",
		16
	);
	const prevJwt = await hkdf(
		"sha512",
		`${month - 1} this is the most secrets thing !!!`,
		salt,
		"JWT",
		16
	);
	return { currentJwt, prevJwt, salt };
});

import { Digiflazz } from "./digiflazz";
export const digiflazz = init(() => {
	return new Digiflazz({
		webhookKey: "",
		apikey: env.DIGIFLAZZ_APIKEY as string,
		username: env.DIGIFLAZZ_USERNAME as string
	});
});

import postgres from "postgres";
import { InvoiceRepo, InvoiceItemRepo, AccountRepo, ConfigRepo } from "./repo";
import { InvoiceService, AccountService } from "./service";
import { MidtransPayment, PaymentError, TripayPayment } from "./payment";
import { DateTime } from "luxon";
const sql = init(() => {
	return postgres(env.DATABASE_URL as string, {
		ssl: env.NODE_ENV === "production" || !!env.DATABASE_SSL,
		transform: {
			undefined: null,
			...postgres.camel
		},
		types: {
			timestamp: {
				to: 1114,
				from: [1082, 1114, 1184],
				serialize: (date: unknown) => {
					if (!(date instanceof Date)) {
						date = new Date(date as string);
					}
					return (date as Date).toISOString() + "Z";
				},
				parse: (date: string) => {
					return new Date(date + "Z");
				}
			}
		}
	});
});

import { Tripay } from "./tripay";
export const tripay = init(() => {
	if ((env.PAYMENT as string) !== "tripay") {
		return null;
	}
	return new Tripay({
		sandbox: false,
		secret: env.TRIPAY_SECRET as string,
		apikey: env.TRIPAY_APIKEY as string,
		merchantCode: env.TRIPAY_MERCHANT_CODE as string
	});
});

export const payment = init(() => {
	if ((env.PAYMENT as string) === "tripay") {
		return new TripayPayment({
			sandbox: (env.NODE_ENV as string) !== "production",
			secret: env.TRIPAY_SECRET as string,
			apikey: env.TRIPAY_APIKEY as string,
			merchantCode: env.TRIPAY_MERCHANT_CODE as string
		});
	}
	return new MidtransPayment({
		sandbox: (env.NODE_ENV as string) !== "production",
		serverKey: env.MIDTRANS_SERVER_KEY as string,
		clientKey: env.MIDTRANS_CLIENT_KEY as string,
		merchantId: env.MIDTRANS_MERCHANT_ID as string
	});
});

export const accountRepo = init(() => {
	return new AccountRepo(sql);
});
export const configRepo = init(() => {
	return new ConfigRepo(sql);
});
export const invoiceRepo = init(() => {
	return new InvoiceRepo(sql);
});
export const invoiceItemRepo = init(() => {
	return new InvoiceItemRepo(sql);
});

export const invoiceService = init(() => {
	return new InvoiceService(invoiceRepo, invoiceItemRepo, digiflazz, payment, accountRepo);
});
export const accountService = init(() => {
	return new AccountService(accountRepo);
});

import { ZodError } from "zod";
import type { Action } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";

export function wrapAction(fn: Action): Action {
	return async (p) => {
		try {
			return await fn(p);
		} catch (e: any) {
			if (e instanceof ZodError) {
				return fail(400, {
					success: false,
					message: e.issues[0].path.join(".") + ": " + e.issues[0].message
				});
			}
			if (!!e.status) {
				throw e;
			}
			console.error(e);
			return fail(400, { success: false });
		}
	};
}
