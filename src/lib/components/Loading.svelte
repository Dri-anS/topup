<script lang="ts">
	import { onMount } from "svelte";
	import { navigating } from "$app/stores";

	const delay = (d = 100) => new Promise((r) => setTimeout(r, d));

	let percentage = 1;
	$: if ($navigating) {
		percentage = 1;
	}
	$: if (!$navigating) {
		percentage = 100;
	}

	async function loading() {
		while (true) {
			await delay();
			if (percentage > 90) {
				continue;
			}
			if (percentage > 50) {
				percentage += ((Math.random() * (100 - percentage)) / 3) | 0;
			} else {
				percentage += 17;
			}
		}
	}

	onMount(() => {
		loading();
	});
</script>

{#if percentage < 100}
	<div class="fixed top-0 w-full h-full z-50">
		<div
			class="bg-info h-1 transition-[width] ease-linear duration-100"
			style="width: {percentage}%;"
		/>
	</div>
{/if}
