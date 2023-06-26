<script lang="ts">
	import Icon from "@iconify/svelte";
	import { theme } from "$lib/store";
	import { page } from "$app/stores";
	import ThemeChooser from "$lib/components/ThemeChooser.svelte";
</script>

<nav class="navbar bg-base-100 space-x-2 sticky top-0 z-20 backdrop-blur-sm bg-opacity-80">
	<div class="flex-1 mx-1">
		<a href="/" class="flex items-center space-x-2">
			<div class="avatar">
				<div class="rounded-lg h-10">
					<img src={$page.data.config.appLogo} alt="app" />
				</div>
			</div>
		</a>
	</div>

	{#if $page.data.config.theme === ""}
		<div class="flex-0">
			<ThemeChooser />
		</div>
	{/if}

	<label for="menu-drawer" class="btn btn-ghost rounded lg:hidden">
		<Icon icon="mdi:menu" class="h-6 w-6" />
	</label>
</nav>
