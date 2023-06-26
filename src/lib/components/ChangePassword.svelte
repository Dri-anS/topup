<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/stores";

	let newPassword = "";
	let confirmPassword = "";
</script>

<form class="form-control" method="POST" action="/auth?/reset" use:enhance>
	<h2 class="text-2xl font-bold">Ganti Password</h2>
	<label for="oldPassword"> Password Lama </label>
	<input
		type="password"
		name="oldPassword"
		id="oldPassword"
		class="input input-sm input-bordered"
	/>
	<label for="newPassword"> Password Baru </label>
	<input
		type="password"
		bind:value={newPassword}
		name="newPassword"
		id="newPassword"
		class="input input-sm input-bordered"
	/>
	<label for="confirmPassword"> Konfirmasi Password Baru </label>
	<input
		type="password"
		bind:value={confirmPassword}
		name="confirmPassword"
		id="confirmPassword"
		class="input input-sm input-bordered"
	/>
	<div class="divider" />
	<button
		type="submit"
		class="btn btn-primary"
		disabled={newPassword !== confirmPassword || !newPassword}
	>
		Ganti
	</button>
	{#if $page.form?.success}
		<div class="alert alert-info">Berhasil mengganti password</div>
	{/if}
</form>
