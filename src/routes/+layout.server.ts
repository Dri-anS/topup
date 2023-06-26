import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { config, payment, digiflazz, accountRepo, PublicAccountSchema } from "$lib/server";

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const adminBalance =
		locals.user?.level === "ADMIN"
			? await digiflazz
					.checkDeposit()
					.then((d: any) => d.deposit)
					.catch(() => 0)
			: 0;
	const user =
		locals.user &&
		(await accountRepo
			.findByEmail(locals.user.email)
			.then((u) => PublicAccountSchema.parse(u))
			.catch((e) => null));
	if (user === null) {
		cookies.delete("session", {
			path: "/",
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			maxAge: 7 * 24 * 60 * 60
		});
		throw redirect(302, "/");
	}
	return {
		config,
		adminBalance,
		user: user || null,
		payment: payment.name,
		clientKey: (payment as any).clientKey
	};
};
