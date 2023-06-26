<script lang="ts">
	export let group: string;
	export let lists = [] as any[];
	export let price = 0;
	export let payment = "";
	let open = false;
	function sort(lists: any[]) {
		return Array.from(lists).sort((a, b) => (a.code > b.code ? 1 : -1));
	}
</script>

{#if group === "E-Wallet" || price > 1e4 || !price}
	<div
		class="collapse flex flex-col w-full"
		class:collapse-open={open}
		class:collapse-close={!open}
	>
		<button
			on:click={() => (open = !open)}
			class="font-medium text-xl collapse-title flex flex-col w-full px-4"
		>
			<span class="divider"> {group} </span>
			<div class="flex flex-row py-2 gap-2 overflow-x-auto no-scrollbar w-full" class:hidden={open}>
				{#each sort(lists) as { code } (code)}
					<div class="bg-white rounded-btn">
						<img
							src="/payment-icons/{code.toUpperCase()}.webp"
							alt={code.toUpperCase()}
							class="object-contain h-8 w-full min-w-[8rem]"
						/>
					</div>
				{/each}
			</div>
		</button>
		<div class="flex flex-col w-full gap-4 collapse-content">
			{#each sort(lists) as { code, name, feeFlat, feePercent }}
				<label
					class="card card-compact card-side w-full card-bordered border-info rounded-btn overflow-hidden"
				>
					<input
						bind:group={payment}
						type="radio"
						name="payment"
						value={code}
						class="hidden peer"
					/>
					<figure class="bg-white w-1/3">
						<img
							src="/payment-icons/{code.toUpperCase()}.webp"
							loading="lazy"
							alt={name}
							class="object-cover px-2 max-h-16"
						/>
					</figure>
					<div class="card-body w-2/3 peer-checked:bg-info peer-checked:text-info-content">
						<div class="font-medium text-md">{name}</div>
						{#if price}
							{@const p = Math.ceil((price * (parseFloat(feePercent) + 100)) / 100) + feeFlat}
							<span> Rp. {p.toLocaleString("id-ID")} </span>
						{/if}
					</div>
				</label>
			{/each}
		</div>
	</div>
{/if}
