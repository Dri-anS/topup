<script lang="ts">
	import { enhance } from "$app/forms";
	export let data;
	export let form;
	let loading = false;
	$: products = data.products as any[];
</script>

<div class="p-4">
	<div class="card card-compact bg-base-100 w-full mx-auto max-w-xl">
		<form class="card-body" use:enhance action="?/order" method="POST">
			<div class="card-title">Manual Transaksi</div>
			<label class="input-group">
				<span> SKU </span>
				<select class="select select-bordered select-sm md:select-md flex-auto">
					{#each products as { buyer_sku_code: sku } (sku)}
						<option value={sku}> {sku} </option>
					{/each}
				</select>
			</label>
			<div class="divider" />
			{#if form && !form?.success}
				<div class="alert alert-error">
					<ul>
						{#each form.issues || [] as i}
							<li>{i.message}</li>
						{:else}
							<li>
								<span> {form.message || "maaf gagal memproses"} </span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			<button class="btn btn-primary" type="submit" class:loading on:click={() => (loading = true)}>
				Buat
			</button>
		</form>
	</div>
</div>
