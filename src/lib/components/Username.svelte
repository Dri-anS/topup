<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/stores";
	import { persist } from "$lib/store";

	export let game = "ML";
	export let customerNo = "";
	const data = persist("usernname-data", {
		userId: "",
		zoneId: ""
	});
	$: customerNo = `${$data.userId}${$data.zoneId}`;
</script>

<div class="card shadow mx-auto max-w-xl w-full bg-base-100">
	<form
		class="card-body form-control"
		use:enhance={() => {
			return ({ update }) => {
				update({ reset: false });
			};
		}}
		method="POST"
		action="?/username"
	>
		<h2 class="card-title">Akun</h2>
		<label class="label"> User ID </label>
		<input
			type="number"
			name="userId"
			class="input input-bordered"
			autocomplete="off"
			placeholder="user id"
			bind:value={$data.userId}
		/>
		<label class="label"> Zone ID </label>
		<input
			type="number"
			name="zoneId"
			class="input input-bordered"
			autocomplete="off"
			placeholder="zone id"
			bind:value={$data.zoneId}
		/>
		<input name="game" class="hidden" value={game} />
		<button class="btn btn-primary" type="submit" disabled={!$data.userId || !$data.zoneId}>
			Check
		</button>

		{#if $page.form?.data}
			<div class="alert alert-info">
				<span> Username kamu adalah: {$page.form.data} </span>
			</div>
		{/if}
		{#if $page.form?.error}
			<div class="alert alert-error">
				<span> {$page.form.error} </span>
			</div>
		{/if}
	</form>
</div>
