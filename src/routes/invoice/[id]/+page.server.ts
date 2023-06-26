import {
	invoiceRepo,
	invoiceItemRepo,
	InvoiceItemSchema,
	payment,
	accountService,
	wrapAction,
	invoiceService
} from "$lib/server";
import { error, fail } from "@sveltejs/kit";

const PublicInvoiceItemSchema = InvoiceItemSchema.omit({
	priceReal: true,
	wa: true,
	tele: true
});

export const load = async ({ params, setHeaders }: any) => {
	try {
		const invoice = (await invoiceRepo.find(params.id)) as any;
		invoice.items = await invoiceItemRepo
			.findByInvoiceId(invoice.id)
			.then((items) => PublicInvoiceItemSchema.array().parse(items));
		setHeaders({
			"cache-control": "private, max-age=0, no-cache, no-store, must-revalidate"
		});
		return { invoice };
	} catch {
		throw error(404, "not found");
	}
};

export const actions = {
	approve: wrapAction(async ({ request, locals }) => {
		const data = (await request.formData().then((d) => Object.fromEntries(d))) as any;
		if (locals.user.level === "NORMAL" || !locals.user) {
			throw error(404, "not found");
		}
		if (locals.user.level === "RESELLER") {
			const invoice = await invoiceRepo.find(data.id);
			const user = await accountService.addBalance(locals.user.email, -invoice.amount);
			if (!user) {
				return fail(400, { message: "Saldo anda tidak cukup untuk meng approve pesanan ini" });
			}
		}
		await invoiceService.updateTransaction({
			id: data.id,
			transactionId: "ADMIN-APPROVAL",
			transactionStatus: "PAID"
		});
		return { success: true };
	})
};
