import { invoiceService } from "$lib/server";

export const load = () => {
	const analytics = invoiceService.analytic() as any[];
	return { analytics };
};
