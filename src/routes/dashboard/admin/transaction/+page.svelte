<script lang="ts">
	import Table from "$lib/components/Table.svelte";
	import Icon from "@iconify/svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	export let data;
	let id: string;
	$: currentPage = +($page.url.searchParams.get("page") ?? "1");

	function setPage(relative: number) {
		const url = new URL($page.url.href);
		url.searchParams.set("page", (currentPage + relative).toString());
		goto(url.href);
	}
</script>

<div class="p-4">
	<div class="card card-compact bg-base-100 w-full mx-auto max-w-xl">
		<div class="card-body">
			<h1 class="card-title">Transaksi</h1>
			<div class="form-control">
				<label class="input-group">
					<span> Id </span>
					<input
						type="text"
						name="id"
						bind:value={id}
						class="input input-bordered bg-base-200/20 w-full"
					/>
				</label>
				<a class="btn btn-sm btn-primary mt-2" href="/dashboard/admin/transaction/{id}"> Cek </a>
				<a class="btn btn-sm btn-info mt-2" href="/dashboard/admin/transaction/manual"> manual </a>
			</div>
			<Table
				items={data.invoices}
				columns={{
					id: "id",
					transactionId: "gateway ref",
					sku: "kode",
					method: "metode",
					email: "email",
					phone: "telepon",
					telegram: "telegram",
					payStatus: "pembayaran",
					error: "error",
					amount: "jumlah",
					createdAt: "dibuat"
				}}
				compact
				additionalColumns={["Aksi"]}
				let:item
			>
				<svelte:fragment slot="button">
					<button class="btn btn-sm" on:click={() => setPage(-1)}>
						<Icon icon="mdi:arrow-left-thin" />
					</button>
					<button class="btn btn-info btn-sm"> {currentPage} </button>
					<button class="btn btn-sm" on:click={() => setPage(1)}>
						<Icon icon="mdi:arrow-right-thin" />
					</button>
				</svelte:fragment>
				<td slot="additional">
					<a class="btn btn-xs btn-primary" href="/invoice/{item.id}"> Lihat </a>
				</td>
			</Table>
		</div>
	</div>
</div>
