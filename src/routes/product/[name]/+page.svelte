<script lang="ts">
	import PaymentCollapse from "$lib/components/PaymentCollapse.svelte";
	import UsernameCheck from "$lib/components/UsernameCheck.svelte";
	import Username from "$lib/components/Username.svelte";
	import Icon from "@iconify/svelte";
	import { page } from "$app/stores";
	import { enhance, applyAction } from "$app/forms";
	import type { PageData } from "./$types";
	export let data: PageData;
	export let form: any;
	let customerNo = "";
	let payment = "";
	let nominal: number;
	let phone: string;
	let category = data.items[0]?.category;
	$: type = (category, data.items.find((ui) => ui.category === category)?.type);
	let items: any[] = [];
	$: items = data.items;
	$: items = nominalSort(items, nominal);
	let loading = false;
	let errors: Error[] = [];
	let modifer = 1;
	let selectedProduct = "";
	$: selectedPrice = data.items.find((i) => i.buyer_sku_code === selectedProduct)?.price || 0;
	let customerNumberName = getCustomerNumberName($page.params.name);
	function nominalSort(items: any, nominal = 0) {
		if (!nominal) {
			return items;
		}
		return Array.from(items)
			.sort((a: any, b: any) => {
				const absA = Math.abs(nominal * modifer - getNominal(a.product_name));
				const absB = Math.abs(nominal * modifer - getNominal(b.product_name));
				return absA - absB;
			})
			.slice(0, 6);
	}
	function getNominal(s: string) {
		const [d] = /[\d.,]+/gi.exec(s) || ["-9999999999"];
		return Number(d.replace(/[^\d]/gi, ""));
	}

	function filterItems(items: any[], type: any, category: any) {
		return items.filter((i) => {
			return (
				(i?.type === type || type === "Semua") && (i.category === category || category === "Semua")
			);
		});
	}

	function getTypes(items: any[], category: any) {
		const types = items.filter((i) => i?.category === category).map((i) => i?.type);
		return [...new Set(types)];
	}
	function getCategories(items: any[]) {
		const categories = items.map((i) => i.category);
		return [...new Set(categories)];
	}

	function getCustomerNumberName(s: string) {
		switch (s) {
			case "arena-of-valor":
			case "call-of-duty-mobile":
				return "OpenID";
			default:
				return "Nomor Pelanggan";
		}
	}
</script>

<form
	class="p-4 flex flex-col flex-auto gap-4"
	action="?/order"
	method="POST"
	on:change={() => (form = null)}
	use:enhance={({ cancel }) => {
		errors = [];
		loading = true;
		if (!customerNo) {
			errors.push(new Error("Harap isi Nomor Pelanggan"));
		}
		if (!selectedProduct) {
			errors.push(new Error("Harap isi Nominal"));
		}
		if (!payment) {
			errors.push(new Error("Harap isi Metode Pembayaran"));
		}
		if (!phone && ["SHOPEEPAY", "DANA", "OVO"].includes(payment)) {
			errors.push(new Error("Harap isi nomor whatsapp"));
		}
		errors = errors;
		if (errors.length) {
			cancel();
			loading = false;
			return;
		}
		return ({ result }) => applyAction(result).finally(() => (loading = false));
	}}
>
	<div class="card shadow mx-auto max-w-xl w-full bg-base-100">
		<figure class="relative">
			<img
				src="/product/{$page.params.name}/banner.webp"
				class="aspect-[16/9] object-cover w-full"
				alt="{$page.params.name} banner"
			/>
		</figure>
		<div class="card-body">
			<h1 class="card-title capitalize">{$page.params.name.replace(/-/gi, " ")}</h1>
			<ol class="list-decimal px-4 text-sm">
				{#if data.items.some((i) => i.category === "Games")}
					<li>
						Masukan User Id dan Zone/Server Id (Jika ada) atau cari Username pada kolom pertama
					</li>
				{:else if data.items.some((i) => ["Pulsa", "E-Money", "Data"].includes(i.category))}
					<li>Masukan nomor pelanggan (dengan kode negara)</li>
				{/if}
				<li>Pilih nominal yang anda inginkan</li>
				<li>Pilih Methode pembayaran</li>
				<li>Masukan kontak (digunakan saat top up gagal)</li>
				<li>Tekan tombol order</li>
				<li>Lakukan pembayaran</li>
			</ol>
		</div>
	</div>

	{#if data.gameCode}
		<Username game={data.gameCode} bind:customerNo />
	{/if}

	<div class="card shadow mx-auto max-w-xl w-full bg-base-100" class:hidden={!!data.gameCode}>
		<div class="card-body">
			<h2 class="card-title">{customerNumberName}</h2>
			<input
				type="text"
				class="input input-bordered"
				name="customerNo"
				bind:value={customerNo}
				placeholder="xxxxxxxxx"
				autocomplete="off"
			/>
		</div>
	</div>

	<div class="card shadow mx-auto max-w-xl w-full bg-base-100">
		<div class="card-body">
			<label class="input-group w-full">
				<span>
					<Icon icon="mdi:magnify" />
				</span>
				<input
					type="number"
					class="input w-full input-bordered"
					bind:value={nominal}
					placeholder="Contoh: 266"
				/>
				<select
					class="select select-bordered"
					on:change={(e) => (modifer = +(e.target?.value || ""))}
				>
					<option value="1"> - </option>
					<option value="1000"> K </option>
				</select>
			</label>
			{#if getCategories(data.items).length > 1}
				<h2 class="font-bold text-lg">Kategori</h2>
				<div class="tabs tabs-boxed">
					{#each getCategories(data.items) as t}
						<button class="tab" class:tab-active={t === category} on:click={() => (category = t)}>
							{t}
						</button>
					{/each}
				</div>
			{/if}
			{#if getTypes(data.items, category).length > 1}
				<h2 class="font-bold text-lg">Tipe</h2>
				<div class="tabs tabs-boxed">
					{#each getTypes(data.items, category) as t}
						<button class="tab" class:tab-active={t === type} on:click={() => (type = t)}>
							{t}
						</button>
					{/each}
				</div>
			{/if}

			<h2 class="divider card-title">Nominal</h2>
			<div class="grid grid-cols-2 gap-2">
				{#each filterItems(nominalSort(items, nominal), type, category) as { product_name, price, buyer_sku_code }, i (product_name)}
					<label class="card card-compact card-bordered border-info h-full overflow-hidden">
						<input
							type="radio"
							name="item"
							value={buyer_sku_code}
							class="hidden peer"
							bind:group={selectedProduct}
						/>
						<div class="card-body peer-checked:bg-info peer-checked:text-info-content p-0">
							<span class="mb-auto"> {product_name} </span>
							<span class="text-sm"> Rp. {price.toLocaleString("id-ID")} </span>
						</div>
					</label>
				{/each}
			</div>
		</div>
	</div>

	<div class="card shadow mx-auto max-w-xl w-full bg-base-100">
		<div class="card-body">
			<h2 class="card-title">Payment</h2>
			<div>
				{#each Object.entries(data.payments) as [group, lists] (group)}
					<PaymentCollapse {group} {lists} price={selectedPrice} bind:payment />
				{/each}
				{#if $page.data.user}
					<div class="divider">Saldo</div>
					<label
						class="card card-compact card-side w-full card-bordered border-info rounded-btn overflow-hidden"
					>
						<input
							bind:group={payment}
							type="radio"
							name="payment"
							value="BALANCE"
							class="hidden peer"
						/>
						<figure class="bg-white w-1/3">
							<span class="w-full h-full text-info">
								<Icon icon="mdi:wallet" class="w-full h-full" />
							</span>
						</figure>
						<div class="card-body w-2/3 peer-checked:bg-info peer-checked:text-info-content">
							<div class="font-medium text-md">
								Saldo ({$page.data.user.balance.toLocaleString("id-ID")})
							</div>
							{#if selectedPrice}
								<span> Rp. {selectedPrice.toLocaleString("id-ID")} </span>
							{/if}
						</div>
					</label>
				{/if}
			</div>
		</div>
	</div>

	<div class="card shadow mx-auto max-w-xl w-full bg-base-100">
		<div class="card-body">
			<h2 class="card-title">Kontak (optional)</h2>
			<div class="form-control">
				<label class="label"> Nomor Whatsapp </label>
				<input
					bind:value={phone}
					name="phone"
					type="text"
					class="input input-bordered"
					placeholder="6281xxxxxxxxx"
				/>

				<label class="label"> Email </label>
				<input
					name="email"
					type="text"
					class="input input-bordered"
					placeholder="example@{$page.url.hostname}"
				/>

				<div class="divider" />
				<button class="btn btn-primary" type="submit" class:loading> Order </button>
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
				{#if errors.length}
					<div class="alert alert-error mt-4">
						<ul class="list-disc flex flex-col items-start">
							{#each errors as { message }}
								<li>{message}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>
	</div>
</form>
