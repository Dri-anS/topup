import { invoiceRepo, invoiceItemRepo, InvoiceItemSchema, payment } from "$lib/server";
import { error } from "@sveltejs/kit";

export const load = async ({ params, setHeaders }: any) => {
	try {
		const invoice = await invoiceRepo.find(params.id);
		invoice.items = await invoiceItemRepo.findByInvoiceId(invoice.id);
		return { invoice };
	} catch {
		throw error(404, "not found");
	}
};
