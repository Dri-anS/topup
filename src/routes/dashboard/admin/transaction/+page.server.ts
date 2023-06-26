import { wrapAction, invoiceService } from "$lib/server";
import { error, fail } from "@sveltejs/kit";

export const load = async ({ url }: any) => {
	const page = url.searchParams.get("page") ?? "1";
	const invoices = await invoiceService.list(+page);
	invoices.forEach((i) => {
		i.error = i.items[0].error;
		i.sku = i.items[0].sku;
	});
	return { invoices };
};

export const actions = {
	approve: wrapAction(async ({ request, locals }) => {
		const data = (await request.formData().then((d) => Object.fromEntries(d))) as any;
		if (locals.user?.level !== "ADMIN") {
			throw error(404, "not found");
		}
		await invoiceService.updateTransaction({
			id: data.id,
			transactionId: "ADMIN-APPROVAL",
			transactionStatus: "PAID"
		});
		return { success: true };
	})
};
