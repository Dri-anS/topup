<script lang="ts">
	import { enhance, applyAction } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	$: loading = ($page.form, false);
</script>

<form
	class="form-control"
	method="POST"
	action="/auth?/email"
	use:enhance={() => {
		return async ({ result }) => {
			await applyAction(result);
			await invalidateAll();
		};
	}}
>
	<h2 class="text-2xl font-bold">Ganti Email</h2>
	<label for="email"> Email Baru </label>
	<input
		type="email"
		name="email"
		id="email"
		required
		autocomplete="off"
		class="input input-sm input-bordered"
	/>
	<label for="password"> Password Akun </label>
	<input type="password" name="password" id="password" class="input input-sm input-bordered" />
	<div class="divider" />
	<button type="submit" class="btn btn-primary" class:loading on:click={() => (loading = true)}>
		Ganti
	</button>
	{#if $page.form?.success}
		<div class="alert alert-info">Berhasil mengganti password</div>
	{/if}
</form>
