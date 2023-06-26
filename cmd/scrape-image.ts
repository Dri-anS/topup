import { parseHTML } from "npm:linkedom";
import { basename, resolve } from "https://deno.land/std/path/mod.ts";

const res = await fetch("https://tokogame.com/id-id/search/top-up-games");
const text = await res.text();
const { document } = parseHTML(text);
const data = document.getElementById("__NEXT_DATA__").innerText;
const parsed = JSON.parse(data);
const p = parsed.props.pageProps.prefetchedProducts.data;

for (const { images } of p) {
	const { url } = images[0];
	const file = resolve("static/icons/", basename(url));
	console.log("download from", url, "to", file);
	const res = await fetch(url);
	const buffer = await res.arrayBuffer();
	await Deno.writeFile(file, buffer, {
		create: true
	});
}
const logos = [
	"https://bangjeff.com/assets/img/logos/OVO.png",
	"https://bangjeff.com/assets/img/logos/Dana.png",
	"https://bangjeff.com/assets/img/logos/Shopeepay.png",
	"https://bangjeff.com/assets/img/logos/Gopay.png",
	"https://bangjeff.com/assets/img/logos/qris.png",
	"https://bangjeff.com/assets/img/logos/Linkaja.png",
	"https://bangjeff.com/assets/img/logos/bca.png",
	"https://bangjeff.com/assets/img/logos/mandiri.png",
	"https://bangjeff.com/assets/img/logos/briva.png",
	"https://bangjeff.com/assets/img/logos/bni.png",
	"https://bangjeff.com/assets/img/logos/permatava.png",
	"https://bangjeff.com/assets/img/logos/sinarmasva.png",
	"https://bangjeff.com/assets/img/logos/maybankva.png",
	"https://bangjeff.com/assets/img/logos/danamonva.png",
	"https://bangjeff.com/assets/img/logos/cimbva.png",
	"https://bangjeff.com/assets/img/logos/bncva.png",
	"https://bangjeff.com/assets/img/logos/alfamart.png"
];

for (const url of logos) {
	const file = resolve("static/icons/", basename(url));
	console.log("download from", url, "to", file);
	const res = await fetch(url);
	const buffer = await res.arrayBuffer();
	await Deno.writeFile(file, buffer, {
		create: true
	});
}
