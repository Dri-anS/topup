<script lang="ts">
	import { enhance } from "$app/forms";
	export let data;
	export let form;
	let payment;
	let loading = false;
	$: if ((form, true)) {
		loading = false;
	}
</script>

<div class="p-4 mx-auto max-w-xl w-full">
	<div class="card card-compact bg-base-100 w-full mx-auto">
		<form class="card-body form-control" use:enhance action="?/deposit" method="POST">
			<h1 class="card-title">Deposit</h1>
			<label class="input-group">
				<span>Email</span>
				<input type="email" name="email" class="input w-full input-bordered bg-base-200" />
			</label>
			<label class="input-group">
				<span> Jumlah</span>
				<input type="number" name="nominal" class="input w-full input-bordered bg-base-200" />
			</label>
			<button class="btn btn-primary" class:loading type="submit" on:click={() => (loading = true)}>
				Tambahkan
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
