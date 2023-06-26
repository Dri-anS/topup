import type { PageServerLoad } from "./$types";
import { tripay, channel } from "$lib/server";
import { error, redirect } from "@sveltejs/kit";

function codename(s: string) {
	if (/qris/gi.test(s)) {
		return "QRIS";
	}
	return s.toUpperCase();
}

export const load: PageServerLoad = async ({ params, setHeaders, url }) => {
	if (params.code.toLowerCase() !== params.code) {
		const target = new URL(`/payment/${params.code.toLowerCase()}`, url);
		for (const [k, v] of url.searchParams) {
			target.searchParams.set(k, v);
		}
		throw redirect(308, target.href);
	}

	const code = codename(params.code);
	if (!(channel as any)[code]) {
		throw error(400, {
			message: "unknown payment code"
		});
	}

	setHeaders({
		"cache-control": "public, max-age=86400, immutable"
	});
	return {
		paymentChannel: await tripay!.paymentChannel(),
		instructions: tripay!.paymentInstruction({ code } as any)
	};
};
