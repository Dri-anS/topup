import { payment, invoiceService } from "$lib/server";

export const POST = async ({ request }: any) => {
	const transaction = await payment.verifyCallback(request);
	const items = await invoiceService.updateTransaction(transaction);
	return new Response(JSON.stringify(items), {
		headers: {
			"content-type": "application/json"
		}
	});
};
