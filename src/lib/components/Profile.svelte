<script lang="ts">
	import { page } from "$app/stores";
	import { enhance, applyAction } from "$app/forms";
	import { invalidateAll, invalidate } from "$app/navigation";
	import Jdenticon from "$lib/components/Jdenticon.svelte";
</script>

{#if $page.data.user}
	<div class="card card-compact w-full min-h-24">
		<div class="card-body flex flex-row flex-wrap h-full justify-start">
			<div class="avatar h-full aspect-square">
				<div class="rounded-full">
					<Jdenticon data={$page.data.user.email} />
				</div>
			</div>
			<div class="flex flex-col">
				<h2 class="card-title">{$page.data.user.name}</h2>
				<span> {$page.data.user.level} </span>
			</div>
			<form
				method="POST"
				action="/auth?/logout"
				class="w-full"
				use:enhance={() => {
					return async ({ result }) => {
						await applyAction(result);
						await invalidateAll();
					};
				}}
			>
				<!-- <a href="/dashboard" class="btn btn-primary w-full btn-sm btn-outline mb-2"> Dashboard </a> -->
				<a href="/dashboard/profile" class="btn btn-secondary w-full btn-sm btn-outline mb-2">
					Profile
				</a>
				<button class="btn btn-error w-full btn-sm btn-outline"> Logout </button>
			</form>
		</div>
	</div>
{:else}
	<div class="px-4 flex flex-col gap-2">
		<a class="btn btn-primary w-full btn-sm btn-outline" href="/auth/login"> Login </a>
		<a class="btn btn-primary w-full btn-sm btn-outline" href="/auth/register"> Daftar </a>
	</div>
{/if}
