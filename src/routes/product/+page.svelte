<script lang="ts">
	import Table from "$lib/components/Table.svelte";
	import type { PageData } from "./$types";
	export let data: PageData;
	let category = ""
	let game = ""
	let type = ""
	$: if (category || true) {
		game = ""
	}
	$: if (game || true) {
		type = ""
	}
	$: products = filterProducts(data.products, category, game, type)

	$: categories = getCategories(data.products)
	$: games = getGames(data.products, category)
	$: types = getTypes(data.products, category, game)
	
	function getCategories(products: any[]) {
		return [...new Set(products.map(p => p.category))].sort()
	}

	function getGames(products: any[], category: string) {
		return [...new Set(products.filter(c => c.category === category).map(c => c.brand))].sort()
	}

	function getTypes(products: any[], category: string, game: string) {
		return [...new Set(products.filter(c => c.category === category && c.brand === game).map(c => c.brand))].sort()
	}

	function filterProducts(products: any[], category: string, game: string, type: string) {
		return products
			.filter(p => !category || p.category === category)
			.filter(p => !game || p.brand === game)
			.filter(p => !type || p.type === type)
	}
</script>

<div class="p-4 mx-auto max-w-xl w-full">
	<div class="card card-compact w-full bg-base-100">
		<div class="card-body">
			<h1 class="card-title">Produk</h1>

			<h2 class="text-md md:text-lg font-bold">Kategori</h2>
			<div class="tabs tabs-boxed">
				{#each categories as c (c)}
					<button class="tab" class:tab-active={category === c} on:click={() => category = c}>
						{c}
					</button>
				{/each}
			</div>

			{#if games.length > 1}
				<h2 class="text-md md:text-lg font-bold">Produk</h2>
				<div class="tabs tabs-boxed">
					{#each games as g (g)}
						<button class="tab" class:tab-active={game === g} on:click={() => game = g}>
							{g}
						</button>
					{/each}
				</div>
			{/if}

			{#if types.length > 1}
				<h2 class="text-md md:text-lg font-bold">Tipe</h2>
				<div class="tabs tabs-boxed">
					{#each types as t (t)}
						<button class="tab" class:tab-active={type === t} on:click={() => type = t}>
							{t}
						</button>
					{/each}
				</div>
			{/if}

			<button class="btn btn-warning" on:click={() => category = ""}> Bersihkan Filter </button>

			<Table
				items={products}
				columns={{
					brand: "aplikasi",
					product_name: "item",
					price: "normal",
					priceR: "RESELLER",
					category: "kategori",
					type: "tipe",
					status: "Status"
				}}
				compact
				tabs
				noOmit={["brand"]}
				let:item
				let:value
				let:key
			>
				<td slot="column">
					{#if key === "brand"}
						<a class="link capitalize" href="product/{value}"> {value} </a>
					{:else if key.startsWith("price")}
						Rp. {value.toLocaleString("id-ID")}
					{:else if key === "status"}
						<span class="badge badge-sm" class:badge-info={value} class:badge-error={!value}>
							{value ? "Aktif" : "Non-Aktif"}
						</span>
					{:else}
						{value}
					{/if}
				</td>
			</Table>
		</div>
	</div>
</div>
