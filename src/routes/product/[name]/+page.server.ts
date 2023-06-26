import type { PageServerLoad } from "./$types";
import { digiflazz } from "$lib/server";
import { replaceBrand, gameCode } from "$lib/pmap";
import { redirect } from "@sveltejs/kit";
import {
	config,
	invoiceService,
	InvoiceRepo,
	InvoiceService,
	wrapAction,
	accountService
} from "$lib/server";
import { calculatePrice } from "$lib/pmap";
import { json, fail } from "@sveltejs/kit";
import { env } from "$env/dynamic/private"

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const normalized = params.name.toLowerCase().replace(/\s/gi, "-");
	if (normalized !== params.name) {
		const target = new URL("/product/" + normalized, url);
		throw redirect(307, target.href);
	}
	const priceList = (await digiflazz.priceList()) as any[];
	const items = priceList
		.filter((p) => p.buyer_product_status && p.seller_product_status)
		.filter((p) => p.brand.toLowerCase().replace(/\s/gi, "-") === params.name)
		.map((p) => {
			p.product_name = replaceBrand(p.product_name);
			return p;
		})
		.map(({ product_name, price, type, buyer_sku_code, category }) => {
			return {
				product_name,
				price: calculatePrice(config, price, category, locals.user?.level || "NORMAL"),
				type,
				buyer_sku_code,
				category
			};
		})
		.sort((a, b) => a.price - b.price);
	return { items, gameCode: gameCode(params.name) };
};

export const actions = {
	order: wrapAction(async ({ request, locals, url }) => {
		const r = await request.formData().then(Object.fromEntries);
		const callbackUrl = new URL(`/invoice`, url).href;
		const req = InvoiceService.createTransactionSchema.parse({
			method: r.payment,
			customerName: r.name || locals.user?.name || "pengguna",
			customerEmail: r.email || locals.user?.email || "pengguna@top.up",
			customerPhone: r.phone || locals.user?.phone,
			items: [
				{
					name: r.item,
					id: r.item,
					price: 1,
					quantity: 1,
					customerNo: r.customerNo
				}
			],
			level: locals.user?.level || "NORMAL",
			callbackUrl
		});

		if (req.method === "BALANCE") {
			const tx = await invoiceService.balanceTransaction(req);
			const user = await accountService.addBalance(locals.user.email, -tx.amount);
			if (!user) {
				await invoiceService.updateTransaction({
					id: tx.id,
					transactionId: tx.id,
					transactionStatus: "FAILED"
				});
				return fail(400, { success: false, message: "Saldo tidak cukup" });
			}
			await invoiceService.updateTransaction({
				id: tx.id,
				transactionId: tx.id,
				transactionStatus: "PAID"
			});
			const target = new URL(`/invoice/${tx.id}`, new URL(request.url));
			throw redirect(302, target.href);
		}

		const data = await invoiceService.createTransaction(req);
		c: if (env.FONNTE_TOKEN) {
			const tokens = env.FONNTE_TOKEN.split(",")
			const token = tokens[Math.random() * tokens.length | 0]
			const inv = data
			if (!inv.phone) {
				break c
			}
			const message = `
Selamat order an mu telah di buat

ID Invoice: ${inv.id}
Item: ${inv.items[0].name}
Tujuan: ${inv.items[0].customerNo}

Anda dapat melakukan pembayaran pada link berikut ${new URL("/invoice/" + inv.id, new URL(request.url)).href}
			`.trim()
			const body = new FormData()
			body.set("countryCode", "62")
			body.set("message", message)
			body.set("target", inv.phone)
			const res = await fetch("https://api.fonnte.com/send", {
				body,
				method: "POST",
				headers: {
					authorization: token,
				}
			})
			if (!res.ok) {
				console.error(await res.text())
			}
		}
		const target = new URL(`/invoice/${data.id}`, new URL(request.url));
		throw redirect(302, target.href);
	}),
	username: wrapAction(async ({ request }) => {
		const form = await request.formData();
		const url = new URL("https://sinten.fly.dev/lookup/");
		for (const [k, v] of form) {
			url.searchParams.set(k, v.toString());
		}
		const res = await fetch(url.href);
		const { data, error } = await res.json();
		return { success: !error, data, error };
	})
};
