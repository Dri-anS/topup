import { invoiceItemRepo } from "$lib/server";

export const load = async ({ setHeaders }: any) => {
	const analytics = (await invoiceItemRepo.analytic()) as any[];
	const month = analytics.reduce((t, i) => t + +i.profit, 0);
	const day = analytics
		.filter((i) => new Date().getTime() - i.day < 1 * 24 * 60 * 60 * 1000)
		.reduce((t, i) => t + +i.profit, 0);
	const week = analytics
		.filter((i) => new Date().getTime() - i.day < 7 * 24 * 60 * 60 * 1000)
		.reduce((t, i) => t + +i.profit, 0);
	setHeaders({
		"cache-control": "private, max-age=300, stale-while-revalidate=60"
	});
	return { month, day, week };
};
