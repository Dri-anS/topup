<script lang="ts">
	import { enhance, applyAction } from "$app/forms";
	import { page } from "$app/stores";
	export let form;
	let loading = false;
	$: if ((form, true)) {
		loading = false;
	}
</script>

<h2 class="card-title">Login</h2>
<form
	method="POST"
	use:enhance={() => {
		return ({ result }) => applyAction(result).finally(() => (loading = false));
	}}
	class="form-control"
	action="/auth?/login"
>
	<label for="email-login" class="label"> Email </label>
	<input
		id="email-login"
		class="input input-bordered bg-base-200/40"
		type="text"
		name="email"
		autocomplete="email"
		placeholder="{$page.data.config.owner.split(' ').join('.').toLowerCase()}@{$page.url.hostname}"
	/>

	<label for="password-login" class="label"> Password </label>
	<input
		id="password-login"
		class="input input-bordered bg-base-200/40"
		type="password"
		name="password"
		autocomplete="password"
		placeholder="********"
	/>

	<button
		type="submit"
		class="btn btn-primary mt-4"
		class:loading
		on:click={() => (loading = true)}
	>
		Login
	</button>

	{#if form && !form.success}
		<div class="alert alert-error mt-2">
			<span> Maaf, email atau password yang anda masukkan salah </span>
		</div>
	{/if}
</form>
