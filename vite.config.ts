import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import basicssl from "@vitejs/plugin-basic-ssl";
import pkg from "./package.json" assert { type: "json" };

export default defineConfig({
	server: {
		// https: true
	},
	plugins: [, sveltekit()],
	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"]
	}
});
