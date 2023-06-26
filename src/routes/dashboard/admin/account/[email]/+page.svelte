<script lang="ts">
	import { enhance } from "$app/forms";
	export let data;
	export let form;
	let loading = false;
	let confirmation = 0;
</script>

<div class="p-4 mx-auto max-w-xl w-full">
	<div class="card card-compact bg-base-100 w-full mx-auto">
		<form class="card-body" use:enhance action="?/update" method="POST">
			<div class="card-title">{data.account.email}</div>
			<label for="name" class="label"> Nama </label>
			<input
				type="text"
				id="name"
				name="name"
				class="input w-full input-bordered"
				value={data.account.name}
				autocomplete="off"
			/>
			<label for="telegram" class="label"> Telegram </label>
			<input
				type="text"
				id="telegram"
				name="telegram"
				class="input w-full input-bordered"
				value={data.account.telegram}
				autocomplete="off"
			/>
			<label for="balance" class="label"> Saldo </label>
			<input
				type="number"
				id="balance"
				name="balance"
				class="input w-full input-bordered"
				value={data.account.balance}
				autocomplete="off"
			/>
			<label for="level" class="label"> Level </label>
			<select
				selected={data.account.level}
				class="select select-bordered select-sm md:select-md"
				name="level"
				id="level"
			>
				<option value="ADMIN"> ADMIN </option>
				<option value="RESELLER"> RESELLER </option>
				<option value="NORMAL"> NORMAL </option>
			</select>
			<label for="password" class="label"> Password </label>
			<input
				type="password"
				id="password"
				name="password"
				class="input w-full input-bordered"
				autocomplete="off"
			/>
			<div class="divider" />
			{#if form && !form?.success}
				<div class="alert alert-error">
					<span> Maaf ada yang error </span>
				</div>
			{/if}
			<button class="btn btn-primary" type="submit" class:loading on:click={() => (loading = true)}>
				Sunting
			</button>
			{#if confirmation < 3}
				<button class="btn btn-primary" on:click|preventDefault={() => confirmation++}>
					Hapus (klik {3 - confirmation} kali)
				</button>
			{:else}
				<button
					class="btn btn-warning"
					type="submit"
					formaction="?/delete"
					class:loading
					on:click={() => (loading = true)}
				>
					Hapus
				</button>
			{/if}
		</form>
	</div>
</div>
