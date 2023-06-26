<script lang="ts">
	import LinkedChart from "svelte-tiny-linked-charts/src/LinkedChart.svelte";
	import LinkedLabel from "svelte-tiny-linked-charts/src/LinkedLabel.svelte";
	import LinkedValue from "svelte-tiny-linked-charts/src/LinkedValue.svelte";
	export let data;
	$: labels = data.analytics.map((i) => i.day.toISOString().slice(0, 10));
	$: values = data.analytics.map((i) => i.profit);
</script>

<div class="p-4 mx-auto max-w-xl w-full">
	<div class="card bg-base-100">
		<div class="card-body">
			<h2 class="text-xl font-bold">Profit</h2>
			<div class="stats">
				<div class="stat">
					<span class="stat-title"> 24 Jam Terakhir</span>
					<span class="stat-value">
						Rp. {data.analytics
							.filter((i) => new Date().getTime() - i.day < 1 * 24 * 60 * 60 * 1000)
							.reduce((t, i) => t + +i.profit, 0)
							.toLocaleString("id-ID")}
					</span>
				</div>
				<div class="stat">
					<span class="stat-title"> 7 Hari Terakhir</span>
					<span class="stat-value">
						Rp. {data.analytics
							.filter((i) => new Date().getTime() - i.day < 7 * 24 * 60 * 60 * 1000)
							.reduce((t, i) => t + +i.profit, 0)
							.toLocaleString("id-ID")}
					</span>
				</div>
				<div class="stat">
					<span class="stat-title"> 30 Hari Terakhir</span>
					<span class="stat-value">
						Rp. {data.analytics.reduce((t, i) => t + +i.profit, 0).toLocaleString("id-ID")}
					</span>
				</div>
			</div>
			<h2 class="text-xl font-bold">
				<LinkedLabel linked="profit" />
			</h2>
			<LinkedChart {labels} {values} linked="profit" showValue />
		</div>
	</div>
</div>

<style lang="postcss">
	* > :global(svg) {
		width: 100%;
		height: 4.5rem;
	}
</style>
