<script lang="ts">
	export let data;
	$: profits = [
		["24 am", data.day],
		["1 Minggu", data.week],
		["1 Bulan", data.month]
	];
</script>

<div class="p-4 mx-auto max-w-xl w-full">
	<div class="card card-compact bg-base-100 w-full">
		<div class="card-body">
			<h1 class="card-title">Profit</h1>
			<div class="stats stats-vertical">
				{#each profits as [text, p] (text)}
					<div class="stat">
						<h2 class="stat-title">{text}</h2>
						<span class="stat-value"> Rp. {p.toLocaleString("id-ID")} </span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
