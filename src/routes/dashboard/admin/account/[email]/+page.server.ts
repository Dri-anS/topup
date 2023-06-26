import { wrapAction, accountRepo, accountService, PublicAccountSchema } from "$lib/server";
import { redirect } from "@sveltejs/kit";

export const load = async ({ params }: any) => {
	const { email } = params;
	const account = await accountRepo.findByEmail(email).then((a) => PublicAccountSchema.parse(a));
	return { account };
};

export const actions = {
	update: wrapAction(async ({ request, params }) => {
		const data = (await request.formData().then((d) => Object.fromEntries(d))) as any;
		data.email = params.email;
		await accountService.update(data);
		throw redirect(302, "/dashboard/admin/account");
	}),
	delete: wrapAction(async ({ params }) => {
		params.email && (await accountService.delete(params.email));
		throw redirect(302, "/dashboard/admin/account");
	})
};
