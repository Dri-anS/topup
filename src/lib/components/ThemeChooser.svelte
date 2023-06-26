<script lang="ts" context="module">
	export const availables = [
		"light",
		"dark",
		"cupcake",
		"bumblebee",
		"emerald",
		"luxury",
		"corporate",
		"synthwave",
		"retro",
		"cyberpunk",
		"valentine",
		"halloween",
		"garden",
		"forest",
		"aqua",
		"lofi",
		"pastel",
		"fantasy",
		"wireframe",
		"black",
		"dracula",
		"cmyk",
		"autumn",
		"business",
		"acid",
		"lemonade",
		"night",
		"coffee",
		"winter"
	] as const;
</script>

<script lang="ts">
	import { theme } from "$lib/store";
	import { page } from "$app/stores";
</script>

<div class="dropdown dropdown-end" class:hidden={!!$page.data.config.theme}>
	<span tabindex="0" class="btn btn-ghost rounded"> Theme </span>
	<div
		class="dropdown-content bg-base-200 max-h-72 overflow-y-auto shadow-lg border border-base-content rounded"
		tabindex="0"
	>
		<ul class="menu menu-compact rounded">
			{#each availables as t (t)}
				<li class="">
					<button
						class="btn btn-ghost btn-primary rounded-none"
						class:active={t === $theme}
						on:click={() => ($theme = t)}
					>
						{t}
					</button>
				</li>
			{/each}
		</ul>
	</div>
</div>
