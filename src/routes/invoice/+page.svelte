<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/stores";
	import { invoices } from "$lib/store";
	import Table from "$lib/components/Table.svelte";

	let id: string;
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
</script>

<div class="max-w-3xl p-4 w-full flex flex-col mx-auto">
	<div class="card card-compact bg-base-100">
		<div class="card-body">
			<h2 class="card-title">Invoice</h2>
			<label class="input-group">
				<span> Kode </span>
				<input
					bind:value={id}
					type="text"
					name="code"
					class="input input-bordered w-full"
					placeholder="{$page.data.config.invoicePrefix}-XXXXXXXXXXXXXXXX"
					autocomplete="off"
				/>
			</label>
			<a class="btn btn-primary btn-sm" href="/invoice/{id}"> Check </a>

			<Table
				items={$invoices}
				columns={{
					id: "Kode Transaksi",
					amount: "Harga",
					method: "Metode",
					payStatus: "Status",
					customerNo: "Nomor Customer",
					actions: "Aksi"
				}}
				compact
				let:key
				let:value
				let:item
			>
				<svelte:fragment slot="column">
					{#if key === "id"}
						<td class="font-ibm">
							<a href="/invoice/{value}" class="link"> {value} </a>
						</td>
					{:else if key === "actions"}
						<td class="w-max">
							<a href="/invoice/{item.id}" class="btn btn-info btn-xs"> Info </a>
						</td>
					{:else if key === "payStatus"}
						<td class="w-max"> {payStatus(value)}</td>
					{:else}
						<td>
							{item[key] || item.items?.[0][key]}
						</td>
					{/if}
				</svelte:fragment>
			</Table>
		</div>
	</div>
</div>
