import { digiflazz } from "$lib/server";
import { replaceBrand } from "$lib/pmap";
import type { PageServerLoad } from "./$types";
import { calculatePrice } from "$lib/pmap";
import { config } from "$lib/server";

export const load: PageServerLoad = async ({ setHeaders }) => {
	const products = (await digiflazz.priceList()) as any[];
	products.forEach((p) => {
		p.product_name = replaceBrand(p.product_name);
	});
	setHeaders({
		"cache-control": "public, max-age=60, stale-while-revalidate=60"
	});
	return {
		products: products
			.map(
				({
					buyer_sku_code,
					product_name,
					brand,
					price,
					category,
					type,
					buyer_product_status,
					seller_product_status
				}) => ({
					buyer_sku_code,
					product_name,
					brand,
					price: calculatePrice(config, price, category, "NORMAL"),
					priceR: calculatePrice(config, price, category, "RESELLER"),
					category,
					type,
					status: buyer_product_status && seller_product_status
				})
			)
			.sort((a, b) => {
				if (a.brand !== b.brand) {
					return a.brand > b.brand ? 1 : -1;
				}
				return a.price - b.price;
			}) as any[]
	};
};
