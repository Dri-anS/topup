<script lang="ts">
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
</script>

<div class="p-8 mx-auto flex flex-col gap-4">
	{#each $page.data.paymentChannel as { code, name, type, group, image }}
		<div class="card card-side card-compact bg-base-100">
			<figure class="w-1/3 bg-white" on:click={() => goto(`/payment/${code}`)}>
				<img src="/payment-icons/{code}.webp" class="object-contain aspect-[2/1] px-2" />
			</figure>
			<div class="card-body">
				<h2 class="card-title">
					<a href="/payment/{code}"> {name} </a>
				</h2>

				<div class="w-full flex flex-row flex-wrap gap-2">
					<div class="badge badge-info">{group}</div>
					<div class="badge badge-info">{type}</div>
				</div>
				<a href="/payment/{code}" class="btn btn-primary btn-xs ml-auto px-4"> Info </a>
			</div>
		</div>
	{/each}
</div>
