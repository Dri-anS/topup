import { installPolyfills } from "@sveltejs/kit/node/polyfills";
if (typeof Headers === "undefined") {
	installPolyfills();
}
import { describe, it, expect } from "vitest";
import { Digiflazz, testingCustomerNo } from "./index";

describe("digiflazz", () => {
	const d = new Digiflazz({
		webhookKey: "",
		apikey: process.env.DIGIFLAZZ_APIKEY as string,
		username: process.env.DIGIFLAZZ_USERNAME as string
	});

	describe("checkDeposit", () => {
		it("should able to checkDeposit", async () => {
			const result = await d.checkDeposit();
			expect(result).toHaveProperty("deposit", expect.any(Number));
		});
	});

	describe("priceList", () => {
		it("should able to priceList", async () => {
			const result = await d.priceList();
			expect(result[0]).toBeDefined();
			expect(result[0]).toHaveProperty("product_name");
			expect(result[0]).toHaveProperty("product_name");
			expect(result[0]).toHaveProperty("category");
			expect(result[0]).toHaveProperty("brand");
			expect(result[0]).toHaveProperty("type");
			expect(result[0]).toHaveProperty("seller_name");
			expect(result[0]).toHaveProperty("price");
			expect(result[0]).toHaveProperty("buyer_sku_code");
			expect(result[0]).toHaveProperty("buyer_product_status");
			expect(result[0]).toHaveProperty("seller_product_status");
			expect(result[0]).toHaveProperty("unlimited_stock");
			expect(result[0]).toHaveProperty("stock");
			expect(result[0]).toHaveProperty("multi");
			expect(result[0]).toHaveProperty("start_cut_off");
			expect(result[0]).toHaveProperty("end_cut_off");
			expect(result[0]).toHaveProperty("desc");
		});
	});

	describe("topup", () => {
		it("success", async () => {
			const body = {
				ref_id: Math.random().toString(36),
				buyer_sku_code: "xld10",
				customer_no: testingCustomerNo.success
			};
			await expect(() => d.topup(body)).not.toThrow();
		});
		it("failed", async () => {
			const body = {
				ref_id: Math.random().toString(36),
				buyer_sku_code: "xld10",
				customer_no: testingCustomerNo.failed
			};
			await expect(() => d.topup(body)).rejects.toThrow();
		});
	});
});
