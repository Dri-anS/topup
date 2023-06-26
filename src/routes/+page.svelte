<script lang="ts">
	import Carousel from "$lib/components/Carousel.svelte";
	import ProductHome from "$lib/components/ProductHome.svelte";
	import { page } from "$app/stores";
	import type { PageData } from "./$types";
	export let data: PageData;
</script>

{#if $page.data.config.banner}
	<Carousel items={$page.data.config.carouselItems} />
{/if}
<ProductHome products={data.products} />
