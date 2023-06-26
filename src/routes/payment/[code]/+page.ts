import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url, parent, data }) => {
	const s = url.searchParams;
	return {
		payCode: s.get("payCode") || "12345(contoh)",
		amount: parseInt(s.get("amount") || "0").toLocaleString("id-ID"),
		qrUrl: s.get("qrUrl") as string,
		...data
	};
};
