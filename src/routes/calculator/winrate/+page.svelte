<script lang="ts">
	import { winstreak } from "$lib/winrate";
	import { persist } from "$lib/store";
	const store = persist<Record<string, number>>("winrate-calculator", {});
	let match = $store.match || 1;
	let winrate = $store.winrate || 0;
	let target = $store.target || 0;
	let error: string | null = "";
	let result = 0;
	$: try {
		result = winstreak(match, winrate, target);
		error = null;
	} catch (e) {
		result = 0;
	}

	$: match < 1 && (error = "match sekarang harus di atas 0");
	$: target < winrate && (error = "target winrate harus lebih dari winrate sekarang");
	$: winrate < 0 && (error = "winrate sekarang harus lebih dari 0%");
	$: winrate > 100 && (error = "winrate sekarang tidak boleh lebih dari 100%");
	$: target < 0 && (error = "target winrate harus lebih dari 0%");
	$: target > 100 && (error = "target winrate tidak boleh lebih dari 100%");
	$: if (!error) {
		$store.winrate = winrate;
		$store.match = match;
		$store.target = target;
	}
</script>

<div class="p-4">
	<div class="card bg-base-100 max-w-md mx-auto">
		<div class="card-body">
			<h2 class="card-title">Winrate Calculator</h2>

			<p>
				Winrate calculator adalah sebuah kalkulator yang dapat mengkalkulasi berapa kemenangan yang
				diperlukan untuk mencapai winrate yang di inginkan.
			</p>

			<form class="form-control">
				<label for="wr-match" class="label"> Match Sekarang: </label>
				<input
					id="wr-match"
					class="input input-bordered input-primary"
					type="number"
					min="1"
					bind:value={match}
				/>

				<label for="wr-now" class="label"> Winrate Sekarang: </label>
				<label class="input-group w-full">
					<input
						id="wr-now"
						class="input input-bordered input-primary w-full"
						type="number"
						min="0"
						max="100"
						bind:value={winrate}
					/>
					<span> % </span>
				</label>

				<label for="wr-target" class="label"> Winrate Yang Diinginkan: </label>
				<label class="input-group w-full">
					<input
						id="wr-target"
						class="input input-bordered input-primary w-full"
						type="number"
						min="0"
						max="100"
						bind:value={target}
					/>
					<span> % </span>
				</label>
			</form>

			{#if !error}
				<div class="alert alert-info">
					<div class="block">
						Anda memerlukan setidaknya
						<span class="underline inline font-bold"> {result.toLocaleString("id-ID")} </span>
						match untuk dapat mencapai winrate
						{target}%
					</div>
				</div>
			{:else}
				<div class="alert alert-error">
					<div>
						{error}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
