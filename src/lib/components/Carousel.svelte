<script lang="ts" context="module">
	export type CarouselItem = {
		src: string;
		alt: string;
		hash?: string;
		href?: string;
	};
</script>

<script lang="ts">
	import { onMount } from "svelte";
	export let items: CarouselItem[] = [];
	export let intervalMs = 4000;
	const itemEls: HTMLAnchorElement[] = [];
	onMount(() => {
		if (intervalMs > 0) {
			let first = true;
			const interval = setInterval(() => {
				!first && nextItem();
				first = false;
			}, intervalMs);
			nextItem();
			return () => clearInterval(interval);
		}
	});

	function nextItem() {
		incrItem(1);
	}

	function incrItem(i: number) {
		const idx = itemEls.findIndex((el) => {
			return (((el.parentNode as any).scrollLeft - el.offsetLeft) | 0) <= 0;
		});
		const el = itemEls[(idx + i) % itemEls.length];
		(el.parentNode as any).scrollLeft = el.offsetLeft;
	}
</script>

<div class="carousel {$$props.class}">
	{#each items as { src, alt, hash, href }, i (src + alt)}
		<a class="carousel-item aspect-[16/9] w-full" bind:this={itemEls[i]} href={href || "#"}>
			<img {src} {alt} loading="lazy" class="object-contain m-auto" />
		</a>
	{/each}
</div>
