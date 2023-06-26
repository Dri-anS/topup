import { installPolyfills } from "@sveltejs/kit/node/polyfills";
if (typeof Headers === "undefined") {
	installPolyfills();
}
import { describe, it, expect } from "vitest";
import { Tripay } from "./tripay";

declare module "vitest" {
	export interface TestContext {
		reference?: string;
	}
}

describe("tripay", () => {
	const tripay = new Tripay({
		sandbox: true,
		secret: process.env.TRIPAY_SECRET,
		apikey: process.env.TRIPAY_APIKEY,
		merchantCode: process.env.TRIPAY_MERCHANT_CODE
	});

	let reference: string;

	describe("paymentInstruction", () => {
		it("should able to get", async () => {
			const result = await tripay.paymentInstruction({ code: "MYBVA" });
			expect(result).toEqual([
				{
					title: "Internet Banking",
					steps: [
						"Login ke internet banking Maybank Anda",
						"Pilih menu Transfer lalu pilih Maybank Virtual Account",
						"Pilih Rekening Sumber",
						"Masukkan Nomor VA ({{pay_code}}) dan jumlah pembayaran ({{amount}}) lalu klik Lanjutkan",
						"Detail transaksi akan ditampilkan, pastikan data sudah sesuai lalu klik Lanjutkan",
						"Masukkan SMS Token lalu klik Lanjutkan",
						"Transaksi sukses, simpan bukti transaksi Anda"
					]
				},
				{
					title: "ATM Maybank",
					steps: [
						"Pilih menu Transfer",
						"Pilih Virtual Account",
						"Masukkan nomor Virtual Account ({{pay_code}}) dan jumlah yang harus dibayar ({{amount}})",
						"Pilih Ya",
						"Detail transaksi akan ditampilkan, pastikan data sudah sesuai lalu pilih YA",
						"Transaksi sukses, simpan bukti transaksi Anda"
					]
				}
			]);
		});
	});

	describe("paymentChannel", () => {
		it("should able to get payment channels", async () => {
			const result = await tripay.paymentChannel();
			expect(result).toBeDefined();
			expect(result[0]).toHaveProperty("group");
			expect(result[0]).toHaveProperty("code");
			expect(result[0]).toHaveProperty("name");
			expect(result[0]).toHaveProperty("type");
			expect(result[0]).toHaveProperty("fee_merchant");
			expect(result[0]).toHaveProperty("fee_customer");
			expect(result[0]).toHaveProperty("total_fee");
			expect(result[0]).toHaveProperty("minimum_fee");
			expect(result[0]).toHaveProperty("maximum_fee");
			expect(result[0]).toHaveProperty("icon_url");
			expect(result[0]).toHaveProperty("active");
		});
	});

	describe("closedTx", () => {
		it("should able to create tx", async () => {
			const result = await tripay.closedTx({
				method: "QRISC",
				merchant_ref: Math.random().toString(36),
				amount: 1000,
				customer_name: "testing",
				customer_email: "foo@bar.com",
				order_items: [{ name: "p", price: 1000, quantity: 1 }]
			});
			console.log(result);
			reference = result.reference;

			expect(result).toHaveProperty("reference");
			expect(result).toHaveProperty("merchant_ref");
		});
	});

	describe("closedTxDetail", () => {
		it("should able to get tx detail", async () => {
			const result = await tripay.closedTxDetail(reference);
			console.log(result);
		});
	});
});
