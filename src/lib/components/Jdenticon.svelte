<script lang="ts">
	import { toSvg } from "jdenticon";
	import { page } from "$app/stores";
	export let data: string;
	export let size = 64;

	$: icon = toSvg(data + $page.url.hostname, size, {
		padding: 0
	});
</script>

<div class="{$$props.class} w-full h-full flex bg-white">
	{@html icon}
</div>
