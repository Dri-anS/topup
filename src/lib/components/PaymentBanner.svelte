<script lang="ts">
	import { page } from "$app/stores";
	let cs: any[];
	$: cs = $page.data.paymentChannel;
	$: cs = cs.sort((a, b) => (a > b ? -1 : 1));
</script>

<div class="py-2 my-4 bg-base-200">
	<div class="relative flex overflow-x-hidden h-16">
		<div class="animate-marque1 flex h-full">
			{#each cs as { name, code } (name)}
				<a href="/payment/{code}" class="bg-white overflow-hidden h-full w-48 mr-4 p-2 rounded-btn">
					<img
						loading="lazy"
						class="h-full object-contain mx-auto"
						src="/payment-icons/{code}.webp"
						height="128"
						alt={code}
					/>
				</a>
			{/each}
		</div>
		<div class="animate-marque2 flex h-full absolute top-0">
			{#each cs as { name, code } (name)}
				<a href="/payment/{code}" class="bg-white overflow-hidden h-full w-48 mr-4 p-2 rounded-btn">
					<img
						loading="lazy"
						class="h-full object-contain mx-auto"
						src="/payment-icons/{code}.webp"
						height="128"
						alt={code}
					/>
				</a>
			{/each}
		</div>
	</div>
</div>
