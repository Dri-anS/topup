import { fail, redirect, error } from "@sveltejs/kit";
import { accountService, wrapAction } from "$lib/server";
import { env } from "$env/dynamic/private";

export const actions = {
	login: wrapAction(async ({ request, cookies, url }) => {
		const data = (await request.formData().then((f) => Object.fromEntries(f))) as any;
		const token = await accountService.login(data);
		cookies.set("session", token.accessToken, {
			path: "/",
			httpOnly: true,
			secure: env.NODE_ENV === "production"
		});
		const target = url.searchParams.get("redirect") ?? "/";
		throw redirect(307, target);
	}),
	logout: wrapAction(async ({ cookies }) => {
		cookies.delete("session", {
			path: "/",
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			maxAge: 7 * 24 * 60 * 60
		});
		throw redirect(302, "/");
	}),
	reset: wrapAction(async ({ request, locals }) => {
		const data = (await request.formData().then((f) => Object.fromEntries(f))) as any;
		await accountService.reset(locals.user.email, data.oldPassword, data.newPassword);
		return { success: true };
	}),
	register: wrapAction(async ({ request, cookies, url }) => {
		const data = (await request.formData().then((f) => Object.fromEntries(f))) as any;
		const token = await accountService.register(data);
		cookies.set("session", token.accessToken, {
			path: "/",
			httpOnly: true,
			secure: env.NODE_ENV === "production"
		});
		const target = url.searchParams.get("redirect") ?? "/";
		throw redirect(307, target);
	}),
	email: wrapAction(async ({ request, locals }) => {
		const data = (await request.formData().then((x) => Object.fromEntries(x))) as any;
		await accountService.updateEmail(locals.user.email, data.email, data.password);
		return { success: true };
	})
};

export function load() {
	throw error(404, "not found");
}
