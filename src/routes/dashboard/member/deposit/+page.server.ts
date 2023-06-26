import {
	config,
	invoiceService,
	InvoiceRepo,
	InvoiceService,
	wrapAction,
	accountService
} from "$lib/server";
import { redirect } from "@sveltejs/kit";
export const actions = {
	deposit: wrapAction(async ({ request, locals }) => {
		const r = (await request.formData().then((d) => Object.fromEntries(d))) as any;
		const req = InvoiceService.createTransactionSchema.parse({
			method: r.payment,
			customerName: locals.user?.name,
			customerEmail: locals.user?.email,
			customerPhone: locals.user?.phone,
			items: [
				{
					name: "DEPOSIT",
					id: "DEPOSIT",
					price: r.nominal,
					quantity: 1,
					customerNo: locals.user?.email
				}
			],
			level: locals.user?.level || "NORMAL"
		});
		const data = await invoiceService.createTransaction(req);
		const target = new URL(`/invoice/${data.id}`, new URL(request.url));
		throw redirect(302, target.href);
	})
};
