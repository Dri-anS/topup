<script lang="ts">
	import Jdenticon from "$lib/components/Jdenticon.svelte";
	import ChangePassword from "$lib/components/ChangePassword.svelte";
	import ChangeEmail from "$lib/components/ChangeEmail.svelte";
	import { page } from "$app/stores";
	let selected = "password";
</script>

<div class="card bg-base-100 max-w-2xl mx-auto w-full">
	<div class="card-body">
		<div class="avatar h-32 aspect-square mx-auto">
			<div class="rounded-full">
				<Jdenticon size={128} data={$page.data.user.email} />
			</div>
		</div>
		<h1 class="card-title divider">{$page.data.user.name}</h1>
		<div class="tabs tabs-boxed">
			<button
				class:tab-active={selected === "password"}
				on:click={() => (selected = "password")}
				class="tab capitalize"
			>
				password
			</button>
			<button
				class:tab-active={selected === "email"}
				on:click={() => (selected = "email")}
				class="tab capitalize"
			>
				email
			</button>
		</div>
		{#if selected === "password"}
			<ChangePassword />
		{/if}
		{#if selected === "email"}
			<ChangeEmail />
		{/if}
	</div>
</div>
