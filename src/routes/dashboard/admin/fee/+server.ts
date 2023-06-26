import { config } from "$lib/server";

export const PUT = async ({ request }: any) => {
	const fee = await request.json();
	for (const level of Object.keys(fee)) {
		for (const category of Object.keys(fee[level])) {
			fee[level][category].flat ||= 0
			fee[level][category].percent ||= 0
		}
	}
	config.$set({ fee } as any);
	await config.$save();
	return new Response("");
};
