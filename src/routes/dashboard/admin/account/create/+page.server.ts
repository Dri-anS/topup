import { wrapAction, accountRepo, accountService, PublicAccountSchema } from "$lib/server";
import { redirect } from "@sveltejs/kit";

export const actions = {
	create: wrapAction(async ({ request, params }) => {
		const data = (await request.formData().then((d) => Object.fromEntries(d))) as any;
		data.phone ||= "08100000000";
		await accountService.register(data);
		throw redirect(302, "/dashboard/admin/account");
	})
};
