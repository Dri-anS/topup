<script lang="ts">
	import Table from "$lib/components/Table.svelte";
	import Icon from "@iconify/svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	export let data;
	let email;
	$: currentPage = +($page.url.searchParams.get("page") ?? "1");

	function setPage(relative: number) {
		const url = new URL($page.url.href);
		url.searchParams.set("page", currentPage + relative);
		goto(url.href);
	}
</script>

<div class="p-4">
	<div class="card card-compact bg-base-100 w-full mx-auto">
		<div class="card-body">
			<h1 class="card-title">Akun</h1>
			<div class="form-control">
				<label class="input-group">
					<span> Email </span>
					<input
						type="email"
						name="email"
						bind:value={email}
						class="input input-bordered bg-base-200/20 w-full"
					/>
				</label>
				<a class="btn btn-sm btn-primary mt-2" href="/dashboard/admin/account/{email}"> Cek </a>
				<a class="btn btn-sm btn-info mt-2" href="/dashboard/admin/account/create"> Buat </a>
				<a class="btn btn-sm btn-info mt-2" href="/dashboard/admin/account/deposit"> deposit </a>
			</div>
			<Table
				items={data.accounts}
				compact
				columns={{
					id: "ID",
					email: "email",
					phone: "whatsapp",
					name: "nama",
					level: "level",
					balance: "saldo",
					createdAt: "pendaftaran"
				}}
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
					<a class="btn btn-xs btn-primary" href="/dashboard/admin/account/{item.email}"> Edit </a>
				</td>
			</Table>
		</div>
	</div>
</div>
