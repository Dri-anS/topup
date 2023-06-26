<script lang="ts">
	import "@fontsource/public-sans";
	import "@fontsource/ibm-plex-mono";
	import "../app.css";

	import Drawer from "$lib/components/Drawer.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import NavBar from "$lib/components/NavBar.svelte";
	import Loading from "$lib/components/Loading.svelte";

	import { theme } from "$lib/store";
	import { browser, dev } from "$app/environment";
	import { page } from "$app/stores";

	$: $page.data.config.theme && ($theme = $page.data.config.theme);

	export let data;
</script>

<svelte:head>
	<title>Topup termurah hanya di {$page.url.hostname}</title>
	<meta name="description" content={$page.data.config.ogDescription} />

	<meta property="og:url" content={new URL("/", $page.url).href} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={$page.data.config.ogTitle} />
	<meta property="og:description" content={$page.data.config.ogDescription} />
	<meta property="og:image" content={$page.data.config.ogImage} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:domain" content={$page.url.hostname} />
	<meta property="twitter:url" content={new URL("/", $page.url).href} />
	<meta name="twitter:title" content={$page.data.config.ogTitle} />
	<meta name="twitter:description" content={$page.data.config.ogDescription} />
	<meta name="twitter:image" content={$page.data.config.ogImage} />
</svelte:head>

<div data-theme={browser && ($page.data.config.theme || $theme)}>
	<Drawer>
		<NavBar />
		<Loading />
		<main class="flex flex-auto flex-col bg-base-200">
			<slot />
		</main>
		<Footer />
	</Drawer>
</div>
