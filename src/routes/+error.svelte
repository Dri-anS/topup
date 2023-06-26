<script lang="ts">
	import { page } from "$app/stores";
</script>

{#if $page.status === 404}
	<div class="p-4 flex-auto">
		<div class="card w-full bg-base-100 max-w-2xl mx-auto card-compact h-full">
			<div class="card-body">
				<h1 class="card-title mx-auto">Halaman tidak ditemukan</h1>
				<a href="/" class="btn btn-sm btn-primary btn-outline"> Kembali ke halaman utama </a>
			</div>
		</div>
	</div>
{:else}
	<div class="p-4 flex-auto">
		<div class="card w-full bg-base-100 max-w-2xl mx-auto card-compact h-full">
			<div class="card-body">
				<h1 class="card-title mx-auto text-5xl">{$page.status}</h1>
				<span> {$page.error?.message} </span>
			</div>
		</div>
	</div>
{/if}
