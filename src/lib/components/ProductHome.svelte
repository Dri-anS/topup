<script lang="ts" context="module">
	export interface Product {
		category: string;
		brand: string;
		populer?: boolean;
	}
</script>

<script lang="ts">
	import Icon from "@iconify/svelte";
	import Fuse from "fuse.js";
	import { page } from "$app/stores";
	import { persist } from "$lib/store";
	import type { string } from "zod";
	export let products = [] as Product[];
	let categories = [
		["Semua", "mdi:alphabetical"],
		["Games", "mdi:gamepad-variant-outline"],
		["Pulsa", "mdi:phone"],
		["Data", "mdi:web"],
		["E-Money", "mdi:currency-usd"],
		["Voucher", "mdi:ticket"]
	] as [string, string][];
	let searchTerm = "";
	const category = persist("product-home-category", "Semua", {
		useSessionStorage: true
	});

	function filterProducts(products: Product[], c: string, t: string) {
		if (c === "Semua") {
			products = Array.from(products);
		} else if (c === "Populer") {
			products = products.filter((p) => $page.data.config.populars.includes(p.brand));
		} else {
			products = products.filter((p) => p.category === c);
		}
		if (!t) {
			return products.sort(sortFn);
		}
		const fuse = new Fuse(products, {
			keys: ["brand", "category"]
		});
		return fuse.search(t).map((i) => i.item);
	}

	function sortFn(a: Product, b: Product): number {
		return a.brand > b.brand ? 1 : -1;
	}

	function productName(s: string) {
		return s.toLowerCase().replace(/\s/gi, "-");
	}

	function filterCategories(categories: [string, string][], products: Product[]) {
		return categories.filter((c, i) => products.some((p) => p.category === c[0]) || i < 2);
	}
</script>

<div class="p-4 flex gap-4 flex-col flex-auto">
	<ul
		class="menu menu-compact menu-horizontal rounded-btn gap-2 p-2 bg-base-100 max-w-2xl mx-auto w-full overflow-x-auto flex flex-row flex-nowrap"
	>
		{#each filterCategories(categories, products) as [t, icon] (t)}
			<li>
				<button class="shadow" class:active={$category === t} on:click={() => ($category = t)}>
					<Icon {icon} />
					{t}
				</button>
			</li>
		{/each}
	</ul>

	<div class="card card-compact bg-base-100 max-w-2xl mx-auto w-full px-2">
		<form class="card-body form-control" on:submit|preventDefault>
			<label class="input-group">
				<span>
					<Icon icon="mdi:magnify" />
				</span>
				<input
					type="text"
					placeholder="Cari..."
					class="input input-sm md:input-md w-full input-bordered flex-auto"
					bind:value={searchTerm}
					autocomplete="off"
				/>
				<span>
					<button on:click={() => (searchTerm = "")}>
						<Icon icon="mdi:close" />
					</button>
				</span>
			</label>
		</form>
	</div>

	<div class="card card-compact bg-base-100 max-w-2xl mx-auto w-full">
		<div class="card-body">
			<div class="flex flex-row flex-wrap w-full justify-items-stretch justify-center">
				{#each filterProducts(products, $category, searchTerm) as { brand } (brand)}
					{@const p = productName(brand)}
					<div class="p-1 w-1/3 md:w-1/4 lg:w-1/5 max-w-[7rem] h-[auto]">
						<a
							href="/product/{p}"
							class="btn btn-compact btn-outline overflow-hidden p-2 gap-2 h-full flex flex-col"
						>
							<img
								src="/product/{p}/icon.webp"
								loading="lazy"
								class="rounded-btn aspect-square object-cover bg-white"
								alt="{p} icon"
								height="200"
								width="200"
							/>
							<div class="flex-auto">
								<h2 class="text-xs md:text-md">{brand}</h2>
							</div>
						</a>
					</div>
				{:else}
					<div class="divider">Produk tidak ditemukan</div>
				{/each}
			</div>
		</div>
	</div>
</div>
