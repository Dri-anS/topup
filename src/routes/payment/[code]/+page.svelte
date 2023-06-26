<script lang="ts">
	import type { PageData } from "./$types";
	import { page } from "$app/stores";

	export let data: PageData;
	$: c = $page.data.paymentChannel.find((c) => c.code === $page.params.code.toUpperCase());

	function replaceData(s: string, payCode: string, amount: string) {
		return s.replace("{{pay_code}}", payCode).replace("{{amount}}", amount);
	}
</script>

<div class="p-4 flex flex-col gap-4 max-w-lg mx-auto">
	<div class="card card-side shadow-lg bg-base-100">
		<figure class="w-1/3 bg-white">
			<img src="/payment-icons/{c.code}.webp" class="aspect-[2/1] object-contain px-2" />
		</figure>
		<div class="card-body w-2/3">
			<h1 class="card-title">{c.name}</h1>
		</div>
	</div>

	<div class="stats shadow-md">
		<div class="stat">
			<div class="stat-title">Fee Percent</div>
			<div class="stat-value">{c.total_fee.percent}%</div>
		</div>
		<div class="stat">
			<div class="stat-title">Fee Flat</div>
			<div class="stat-value">Rp. {parseInt(c.total_fee.flat).toLocaleString("id-ID")}</div>
		</div>
	</div>

	{#if c.name.includes("QRIS") && data.qrUrl}
		<div class="card shadow-lg bg-base-100">
			<div class="card-body">
				<img src={data.qrUrl} alt="qris barcode" class="aspect-square" />
			</div>
		</div>
	{/if}

	{#each data.instructions as { title, steps } (title)}
		<div class="card shadow-lg bg-base-100">
			<div class="card-body">
				<h2 class="card-title">{title}</h2>
				<ol class="list-decimal px-6">
					{#each steps as s}
						<li>{replaceData(s, data.payCode, data.amount)}</li>
					{/each}
				</ol>
			</div>
		</div>
	{/each}
</div>
