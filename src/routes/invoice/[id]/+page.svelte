<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { invoices } from "$lib/store";
	import { enhance } from "$app/forms";
	import Icon from "@iconify/svelte";
	import type { PageData } from "./$types";
	export let data: PageData;
	export let form: PageData;
	let loading = false;
	let snap = () => (window as any).snap;
	$: if ((form, true)) {
		loading = false;
	}
	$: invoice = data.invoice;
	$: paymentInstruction = new URL(`/payment/${invoice.method}`, $page.url);
	$: paymentInstruction.searchParams.set("amount", invoice.amount.toString());
	$: invoice.method.toLowerCase().includes("qris") &&
		invoice.payCode &&
		paymentInstruction.searchParams.set("qrUrl", invoice.payCode);
	$: invoice.payCode && paymentInstruction.searchParams.set("payCode", invoice.payCode);
	$: $invoices = [invoice, ...$invoices]
		.filter((i, idx, arr) => {
			return arr.findIndex((ii) => ii.id === i.id) === idx;
		})
		.sort((a, b) => {
			return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
		}) as any[];

	let now = new Date();
	$: seconds = now.getTime() % 60;
	onMount(() => {
		function fn() {
			now = new Date();
			frame = window.requestAnimationFrame(fn);
		}
		let frame = window.requestAnimationFrame(fn);
		return () => window.cancelAnimationFrame(frame);
	});

	function payStatus(s: string) {
		switch (s) {
			case "UNPAID":
				return "Belum Dibayar";
			case "PAID":
				return "Sudah Dibayar";
			case "EXPIRED":
				return "Kadaluwarsa";
			case "FAILED":
				return "Gagal";
			case "REFUND":
				return "Refund";
		}
	}

	function processStatus(s: string) {
		switch (s) {
			case "CREATED":
				return "Menunggu Pembayaran";
			case "PENDING":
				return "Diproses";
			case "SUCCESS":
				return "Sukses";
			case "FAILED":
				return "Gagal";
			case "RECREATED":
				return "Di Buat Ulang";
		}
	}

	function copy(text: string) {
		navigator?.clipboard.writeText(text).catch(() => {});
	}
</script>

<div class="p-4">
	<div class="card card-compact">
		<div class="card-body flex flex-col">
			<h1 class="card-title divider text-3xl font-ibm">Invoice</h1>

			{#if invoice.payStatus === "UNPAID"}
				<span class="font-bold -mb-2"> Metode Pembayaran </span>
				<span class="mb-2"> {invoice.method} </span>

				{#if invoice.method.toLowerCase().startsWith("qris")}
					<span class="font-bold"> Barcode QRIS </span>
					<div class="avatar mx-auto justify">
						<div class="p-2 bg-white rounded-3xl">
							<img src={invoice.payCode} />
						</div>
					</div>
				{:else if invoice.payCode && !["gopay", "qris", "shopeepay", "dana"].includes(invoice.method.toLowerCase())}
					<span class="font-bold -mb-2"> Kode Pembayaran </span>
					<div class="flex flex-row mb-2">
						<span class="font-ibm"> {invoice.payCode} </span>
						<button on:click={() => copy(invoice.payCode)} class="btn btn-xs btn-ghost">
							<Icon icon="mdi:content-copy" />
						</button>
					</div>
				{/if}

				<span class="font-bold -mb-2"> Jumlah Yang harus dibayar </span>
				<span class="mb-2"> Rp. {invoice.amount.toLocaleString("id-ID")} </span>
			{/if}

			<span class="font-bold -mb-2"> Kode Transaksi </span>
			<div class="flex flex-row mb-2">
				<span class="mb-2 font-ibm"> {invoice.id} </span>
				<button on:click={() => copy(invoice.id)} class="btn btn-xs btn-ghost">
					<Icon icon="mdi:content-copy" />
				</button>
			</div>

			<span class="font-bold -mb-2"> Transaksi Dibuat Pada </span>
			<span class="mb-2"> {new Date(invoice.createdAt).toLocaleString("id-ID")} </span>

			<span class="font-bold -mb-2"> Nomor Pelanggan </span>
			<span class="mb-2"> {invoice.items[0].customerNo} </span>

			<span class="font-bold -mb-2"> Emai Pelanggan </span>
			<span class="mb-2"> {invoice.email} </span>

			<span class="font-bold -mb-2"> Telepon Pelanggan </span>
			<span class="mb-2"> {invoice.phone || "-"} </span>

			<span class="font-bold -mb-2"> Status Pembayaran </span>
			<span class="mb-2"> {payStatus(invoice.payStatus)} </span>

			<span class="font-bold -mb-2"> Produk </span>
			<span class="mb-2"> {invoice.items[0].name} </span>

			<span class="font-bold -mb-2"> Kategori produk </span>
			<span class="mb-2"> {invoice.items[0].category} </span>

			{#if invoice.items[0].sn}
				<span class="font-bold -mb-2"> Kode Item </span>
				<span class="mb-2 break-all"> {invoice.items[0].sn} </span>
			{/if}

			{#if invoice.items[0].sku !== "DEPOSIT"}
				<span class="font-bold -mb-2"> Status Item </span>
				<span class="mb-2"> {processStatus(invoice.items[0].processStatus)} </span>
			{/if}

			{#if invoice.payStatus === "UNPAID" && $page.data.payment === "midtrans"}
				<div class="divider" />
				<div class="flex flex-row flex-wrap justify-end gap-2">
					{#if invoice.method === "gopay"}
						<a class="btn btn-primary" href={invoice.payCode}> Gopay </a>
					{:else if invoice.method === "snap"}
						<button
							class="btn btn-primary"
							on:click={() => {
								snap().pay(invoice.payCode, { uiMode: "qr" });
							}}
						>
							Bayar
						</button>
					{/if}
				</div>
			{/if}
			{#if invoice.payStatus === "UNPAID" && $page.data.payment === "tripay"}
				<div class="divider" />
				<a class="btn btn-primary" target="_blank" href={paymentInstruction.href}> Bayar </a>
			{/if}
			{#if ["RESELLER", "ADMIN"].includes($page.data.user?.level) && invoice.payStatus === "UNPAID"}
				<form class="form-control" action="?/approve" use:enhance method="POST">
					<input type="text" name="id" class="hidden" value={invoice.id} />
					<button
						class="btn btn-info"
						type="submit"
						on:click={() => (loading = true)}
						class:loading
					>
						Approve
					</button>
				</form>
			{/if}
			{#if form && !form.success}
				<div class="alert alert-error mt-4">
					{#if form.message}
						<span> {form.message} </span>
					{:else}
						<span>
							Maaf gagal memproses permintaan anda, silahkan mencoba methode pembayaran yang lain
						</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="postcss">
	.card {
		@apply shadow max-w-2xl bg-base-100 mx-auto w-full;
	}
</style>
