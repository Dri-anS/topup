<script lang="ts">
	import { enhance } from "$app/forms";
	export let data;
	export let form;
	let loading = false;
</script>

<div class="p-4 mx-auto max-w-xl w-full">
	<div class="card card-compact bg-base-100 w-full mx-auto">
		<form class="card-body" use:enhance action="?/create" method="POST">
			<div class="card-title">Buat akun</div>
			<label for="name" class="label"> Nama </label>
			<input
				type="text"
				id="name"
				name="name"
				class="input input-sm md:input-md w-full input-bordered"
				autocomplete="off"
			/>
			<label for="email" class="label"> Email </label>
			<input
				type="text"
				id="email"
				name="email"
				class="input input-sm md:input-md w-full input-bordered"
				autocomplete="off"
			/>
			<label for="telegram" class="label"> Telegram </label>
			<input
				type="text"
				id="telegram"
				name="telegram"
				class="input input-sm md:input-md w-full input-bordered"
				autocomplete="off"
			/>
			<label for="phone" class="label"> Whatsapp </label>
			<input
				type="text"
				id="phone"
				name="phone"
				class="input input-sm md:input-md w-full input-bordered"
				autocomplete="off"
			/>
			<label for="balance" class="label"> Saldo </label>
			<input
				type="number"
				id="balance"
				name="balance"
				value="0"
				class="input input-sm md:input-md w-full input-bordered"
				autocomplete="off"
			/>
			<label for="password" class="label"> Password </label>
			<input
				type="text"
				id="password"
				name="password"
				class="input input-sm md:input-md w-full input-bordered"
				autocomplete="off"
			/>
			<div class="divider" />
			{#if form && !form?.success}
				<div class="alert alert-error">
					<ul>
						{#each form.issues || [] as i}
							<li>{i.message}</li>
						{:else}
							<li>
								<span> {form.message || "maaf gagal memproses"} </span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			<button class="btn btn-primary" type="submit" class:loading on:click={() => (loading = true)}>
				Buat
			</button>
		</form>
	</div>
</div>
