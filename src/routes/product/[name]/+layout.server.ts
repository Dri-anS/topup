import { payment } from "$lib/server";

export const load = async () => {
	const p = (await payment.getChannels()) as any[];
	const payments: Record<string, any> = {};
	p.map((i: any) => i.group)
		.sort()
		.forEach((k: any) => (payments[k] = []));
	for (const { group, code, name, feeFlat, feePercent } of p) {
		const g = (payments[group] ??= []);
		g.push({
			code,
			name,
			feeFlat,
			feePercent
		});
	}
	return { payments };
};
