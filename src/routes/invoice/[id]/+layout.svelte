<script lang="ts">
	import { page } from "$app/stores";
	import { dev } from "$app/environment";
</script>

<svelte:head>
	{#if $page.data.clientKey}
		{#if dev}
			<script
				defer
				data-client-key={$page.data.clientKey}
				type="text/javascript"
				src="https://app.sandbox.midtrans.com/snap/snap.js"
			></script>
		{:else}
			<script
				defer
				data-client-key={$page.data.clientKey}
				type="text/javascript"
				src="https://app.midtrans.com/snap/snap.js"
			></script>
		{/if}
	{/if}
</svelte:head>

<slot />
