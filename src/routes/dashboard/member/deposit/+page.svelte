<script lang="ts">
	import PaymentCollapse from "$lib/components/PaymentCollapse.svelte";
	import { enhance } from "$app/forms";
	export let data;
	export let form;
	let payment: string;
	let loading = false;
	let nominal = 0;
	$: if ((form, true)) {
		loading = false;
	}
</script>

<div class="p-4 mx-auto max-w-xl w-full">
	<div class="card card-compact bg-base-100 w-full mx-auto">
		<form class="card-body form-control" use:enhance action="?/deposit" method="POST">
			<h1 class="card-title">Deposit</h1>
			<div>Anda juga dapat deposit manual dengan cara menghubungi admin.</div>
			<label class="input-group">
				<span> Jumlah </span>
				<input type="number" name="nominal" class="input input-bordered" bind:value={nominal} />
			</label>
			<h2 class="card-title mt-4 -mb-4">Metode</h2>
			{#each Object.entries(data.payments) as [group, lists] (group)}
				<PaymentCollapse {group} {lists} price={nominal} bind:payment />
			{/each}
			<button class="btn btn-primary" on:click={() => (loading = true)} type="submit" class:loading>
				Deposit
			</button>
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
		</form>
	</div>
</div>
