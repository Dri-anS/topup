import "dotenv/config";
import type { Handle } from "@sveltejs/kit";
import { config } from "$lib/server";
import { accountService } from "$lib/server";
import { env } from "$env/dynamic/private";
import { building } from "$app/environment";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

if (!building) {
	bcrypt.setRandomFallback((l) => Array.from(randomBytes(l)));
	await config.$load();
}
export const handle: Handle = async ({ event, resolve }) => {
	const accessToken = event.cookies.get("session", {
		secure: env.NODE_ENV === "production"
	} as any);
	if (accessToken) {
		event.locals.user = await accountService.verify(accessToken);
	}
	if (!event.locals.user && event.url.pathname.startsWith("/dashboard")) {
		const url = new URL("/auth/login", event.url);
		url.searchParams.set("redirect", event.url.pathname);
		return new Response("", {
			status: 307,
			headers: {
				location: url.href
			}
		});
	}
	if (event.url.pathname.startsWith("/dashboard/admin") && event.locals.user.level !== "ADMIN") {
		return new Response("forbidden", { status: 403 });
	}
	const res = await resolve(event);
	res.headers.set("x-developed-by", "Kevin Falentio");
	res.headers.delete("transfer-encoding");
	const contentType = res.headers.get("content-type") || "";
	if (contentType.startsWith("image")) {
		res.headers.set("cache-control", "public, max-age=86400");
	}
	if (event.url.pathname.startsWith("/dashboard")) {
		res.headers.set("cache-control", "private, max-age=0, no-store, must-revalidate");
	}
	return res;
};
