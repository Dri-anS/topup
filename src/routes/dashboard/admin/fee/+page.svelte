<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/stores";
	import type { string } from "zod";
	let level = "NORMAL";
	let categoryToAdd = "";
	$: fee = $page.data.config.fee[level] as Record<string, any>;

	const categories = ["Data", "E-Money", "Games", "Masa Aktif", "Paket SMS & Telpon", "Pertagas"]
	let loading = false;
	async function save() {
		try {
			loading = true;
			await fetch("/dashboard/admin/fee", {
				method: "PUT",
				body: JSON.stringify($page.data.config.fee),
				headers: {
					"content-type": "application/json"
				}
			});
		} finally {
			loading = false;
		}
	}
</script>

<div class="p-4 mx-auto max-w-xl w-full">
	<div class="card w-full bg-base-100">
		<div class="card-body flex flex-col">
			<h1 class="card-title">Fee</h1>
			<ul class="menu menu-horizontal menu-compact gap-2">
				<li>
					<button
						on:click={() => (level = "NORMAL")}
						class:active={level === "NORMAL"}
						class="shadow p-2 active"
					>
						Normal
					</button>
				</li>
				<li>
					<button
						on:click={() => (level = "RESELLER")}
						class:active={level === "RESELLER"}
						class="shadow p-2"
					>
						Reseller
					</button>
				</li>
			</ul>

			{#each Object.entries(fee) as [category, f]}
				<div class="form-control gap-2">
					<span class="text-xl font-bold divider"> {category} </span>
					<label class="input-group">
						<span class=""> Percent </span>
						<input
							min="0"
							type="number"
							class="input input-sm w-full input-bordered flex-auto"
							bind:value={f.percent}
						/>
					</label>
					<label class="input-group">
						<span class=""> Flat </span>
						<input
							min="0"
							type="number"
							class="input input-sm w-full input-bordered flex-auto"
							bind:value={f.flat}
						/>
					</label>
					<button
						class:hidden={category === "default"}
						class="btn btn-sm btn-error"
						on:click={() => {
							delete fee[category];
							fee = fee;
						}}
					>
						Hapus
					</button>
				</div>
			{/each}
			<div class="divider" />
			<div>
				<span class="label"> Kategori </span>
				<label class="input-group">
					<!-- <input
						type="text"
						bind:value={categoryToAdd}
						class="input input-sm w-full input-bordered"
					/> -->
					<select class="select flex-auto select-bordered" bind:value={categoryToAdd}>
						{#each categories as c}
							<option>{c}</option>
						{/each}
					</select>
					<button
						on:click={() => {
							const f = $page.data.config.fee
							f.NORMAL = {
								...f.NORMAL,
								[categoryToAdd]: {...f.NORMAL.default},
							}
							f.RESELLER = {
								...f.RESELLER,
								[categoryToAdd]: {...f.RESELLER.default},
							}
							fee = f[level]
							categoryToAdd = "";
						}}
						class="btn btn-primary"
						disabled={!categoryToAdd}
					>
						Tambah
					</button>
				</label>
			</div>
			<button class="btn btn-primary" class:loading on:click={save}> Simpan </button>
		</div>
	</div>
</div>
