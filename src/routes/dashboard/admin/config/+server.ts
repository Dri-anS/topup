import { config } from "$lib/server";

export const PUT = async ({ request }: any) => {
	const body = await request.json();
	config.$set(body);
	await config.$save();
	return new Response("");
};
