import { invoiceService } from "$lib/server";

export const POST = async ({ request }: any) => {
	const text = await request.text();
	const signature = request.headers.get("x-callback-signature");
	const body = await invoiceService.process(text, signature);
	return new Response(JSON.stringify(body, null, "\t"), {
		status: 200,
		headers: { "content-type": "application/json" }
	});
};
