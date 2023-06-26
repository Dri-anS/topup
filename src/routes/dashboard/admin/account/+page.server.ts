import { accountService } from "$lib/server";

export const load = async ({ url }: any) => {
	const page = +(url.searchParams.get("page") ?? "1");
	const accounts = await accountService.list(page);
	return { accounts };
};
