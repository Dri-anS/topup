import {
	wrapAction,
	accountRepo,
	accountService,
	PublicAccountSchema,
	InvoiceService,
	invoiceService
} from "$lib/server";
import { redirect } from "@sveltejs/kit";

export const actions = {
	deposit: wrapAction(async ({ request, params, locals }) => {
		const r = (await request.formData().then((d: any) => Object.fromEntries(d))) as any;
		const req = InvoiceService.createTransactionSchema.parse({
			method: "BALANCE",
			customerName: locals.user?.name,
			customerEmail: locals.user?.email,
			customerPhone: locals.user?.phone,
			items: [
				{
					name: "DEPOSIT",
					id: "DEPOSIT",
					price: parseInt(r.nominal),
					quantity: 1,
					customerNo: r.email
				}
			],
			level: locals.user?.level || "NORMAL"
		});
		console.log(req);
		const data = await invoiceService.balanceTransaction(req);
		await invoiceService.updateTransaction({
			id: data.id,
			transactionId: data.id,
			transactionStatus: "PAID"
		});
		const target = new URL(`/invoice/${data.id}`, new URL(request.url));
		throw redirect(302, target.href);
	})
};
