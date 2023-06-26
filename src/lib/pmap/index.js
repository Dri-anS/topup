// @ts-nocheck
export const replaceBrand = (s) => {
	return s
		.replace(/mobile\s?legends?(\s-\s)?/gi, "")
		.replace(/call\sof\sduty\smobile\s?/gi, "")
		.replace(/telkomsel\s?/gi, "Pulsa ")
		.replace(/dana\s?/gi, "")
		.replace(/vouchers?\s?/gi, "")
		.replace(/google\splay\s?/gi, "")
		.replace(/indonesia\sregion\s?/gi, "")
		.replace(/indosat\s?/gi, "")
		.replace(/pulsa\spulsa/gi, "pulsa")
		.trim();
};

const games = {
	"mobile-legends": "ML"
};

export const gameCode = (s) => {
	return games[s.toLowerCase().replace(/\s/gi, "-")] ?? null;
};

export function calculatePrice(config, price, product, level) {
	const { flat = 0, percent = 0 } = config.fee[level]?.[product] || config.fee[level].default;
	const priceWithFee = (price * (percent + 100)) / 100 + flat;
	return Math.ceil(priceWithFee / config.ceil) * config.ceil;
}
