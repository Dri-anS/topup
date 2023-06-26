import { parseHTML } from "npm:linkedom";

const res = await fetch("https://developer.digiflazz.com/api/buyer/response-code/");
const text = await res.text();
const { document } = parseHTML(text);
const result = {};
const table = document.querySelector("table");
for (const row of table.querySelectorAll("tr")) {
	const [code, msg, status] = Array.from(row.querySelectorAll("td")).map((e) => e.innerText);
	result[code] = { msg, status };
}

const str = `// auto generated file, dont modify, use cmd/digiflazz-error.ts instead

export const responseCode = ${JSON.stringify(result, null, "\t")} as const`;
await Deno.writeTextFile("src/lib/server/digiflazz/code.ts", str, {
	create: true
});
