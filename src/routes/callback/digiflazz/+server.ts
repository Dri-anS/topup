import { invoiceService } from "$lib/server";
import { env } from "$env/dynamic/private";

export const POST = async ({ request }: any) => {
	const { data } = await request.json();
	console.log(data);
	await invoiceService.updateItem({
		id: data.ref_id,
		processStatus:
			data.status === "Sukses" ? "SUCCESS" : data.status === "Pending" ? "PENDING" : "FAILED",
		sn: data.sn,
		error: data.status === "Sukses" ? "-" : data.message
	});
	fonnte: if (env.FONNTE_TOKEN) {
		const tokens = env.FONNTE_TOKEN.split(",");
		const token = tokens[(Math.random() * tokens.length) | 0];
		const id = data.ref_id.split("-").slice(0, 2).join("-");
		const inv = await invoiceService.find(id);
		if (!inv.phone) {
			break fonnte;
		}
		const message = `
Selamat order an mu telah di proses

ID Invoice: ${id}
Item: ${inv.items[0].name}
Tujuan: ${inv.items[0].customerNo}
Status: ${inv.items[0].processStatus}
SN: ${inv.items[0].sn}
Error: ${inv.items[0].error || "-"}

Atau anda dapat mengunjungi link berikut ${new URL("/invoice/" + id, new URL(request.url)).href}
		`.trim();
		const body = new FormData();
		body.set("countryCode", "62");
		body.set("message", message);
		body.set("target", inv.phone);
		const res = await fetch("https://api.fonnte.com/send", {
			body,
			method: "POST",
			headers: {
				authorization: token
			}
		});
		if (!res.ok) {
			console.error(await res.text());
		}
	}
	return new Response("");
};
