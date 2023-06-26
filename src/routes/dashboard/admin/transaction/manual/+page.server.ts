import {
	wrapAction,
	accountRepo,
	accountService,
	PublicAccountSchema,
	digiflazz
} from "$lib/server";
import { redirect } from "@sveltejs/kit";

export const load = async ({}) => {
	const priceList = (await digiflazz.priceList()) as any[];
	const products = priceList
		.filter((p) => p.buyer_product_status && p.seller_product_status)
		.sort((a, b) => (a.buyer_sku_code > b.buyer_sku_code ? 1 : -1));
	return { products };
};

export const actions = {
	update: wrapAction(async ({ request, params }) => {
		const data = (await request.formData().then((d) => Object.fromEntries(d))) as any;
		data.email = params.email;
		await accountService.update(data);
		throw redirect(302, "/dashboard/admin/account");
	})
};
