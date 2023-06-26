import type { PageServerLoad } from "./$types";
import { digiflazz } from "$lib/server";

export const load: PageServerLoad = async ({ locals }) => {
	const priceList = (await digiflazz.priceList()) as any[];
	const products = priceList
		.filter((p) => p.buyer_product_status && p.seller_product_status)
		.filter((p, i, a) => a.findIndex((pp) => pp.brand === p.brand) === i)
		.map(({ brand, category }: any) => ({ brand, category }));
	return { products };
};
