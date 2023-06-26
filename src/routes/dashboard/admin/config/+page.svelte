<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/stores";
	import { invalidateAll } from "$app/navigation";
	import { iconMapper } from "$lib/components/Footer.svelte";
	import { availables } from "$lib/components/ThemeChooser.svelte";
	import Icon from "@iconify/svelte";

	$: populars = $page.data.config.populars;

	let loading = false;
	async function save() {
		try {
			loading = true;
			await fetch("/dashboard/admin/config", {
				method: "PUT",
				body: JSON.stringify($page.data.config),
				headers: {
					"content-type": "application/json"
				}
			});
		} finally {
			loading = false;
		}
	}
</script>

<div class="p-4 mx-auto max-w-xl w-full">
	<div class="card w-full bg-base-100">
		<div class="card-body">
			<h1 class="card-title">Config</h1>

			<form class="form-control space-y-2" on:submit={save}>
				<label for="invoicePrefix" class="label font-bold text-lg"> Invoice Prefix </label>
				<input
					type="text"
					id="invoicePrefix"
					name="invoicePrefix"
					class="input w-full input-bordered"
					bind:value={$page.data.config.invoicePrefix}
					autocomplete="off"
				/>
				<label for="invoicePrefix" class="label font-bold text-lg"> Ceiling </label>
				<input
					type="number"
					id="ceil"
					name="ceil"
					class="input w-full input-bordered"
					bind:value={$page.data.config.ceil}
					autocomplete="off"
				/>
				<label for="appName" class="label font-bold text-lg"> Nama App </label>
				<input
					type="text"
					id="appName"
					name="appName"
					class="input w-full input-bordered"
					bind:value={$page.data.config.appName}
					autocomplete="off"
				/>
				<label for="appLogo" class="label font-bold text-lg"> Logo App </label>
				<input
					type="text"
					id="appLogo"
					name="appLogo"
					class="input w-full input-bordered"
					bind:value={$page.data.config.appLogo}
					autocomplete="off"
				/>
				<label for="ogTitle" class="label font-bold text-lg"> Judul </label>
				<input
					type="text"
					id="ogTitle"
					name="ogTitle"
					class="input w-full input-bordered"
					bind:value={$page.data.config.ogTitle}
					autocomplete="off"
				/>
				<label for="ogImage" class="label font-bold text-lg"> Image (url) </label>
				<input
					type="text"
					id="ogImage"
					name="ogImage"
					class="input w-full input-bordered"
					bind:value={$page.data.config.ogImage}
					autocomplete="off"
				/>
				<label for="ogDescription" class="label font-bold text-lg"> Deskripsi </label>
				<textarea
					rows="7"
					id="ogDescription"
					name="ogDescription"
					class="input w-full input-bordered h-48"
					bind:value={$page.data.config.ogDescription}
					autocomplete="off"
				/>
				<label for="owner" class="label font-bold text-lg"> Nama Pemilik </label>
				<input
					type="text"
					id="owner"
					name="owner"
					class="input w-full input-bordered"
					bind:value={$page.data.config.owner}
					autocomplete="off"
				/>

				<label class="label cursor-pointer">
					<span class="label-text"> Banner </span>
					<input type="checkbox" class="toggle" bind:checked={$page.data.config.banner} />
				</label>

				<label class="input-group">
					<span> Tema </span>
					<select class="select select-bordered flex-auto" bind:value={$page.data.config.theme}>
						<option value=""> User Select </option>
						{#each availables as a}
							<option value={a}> {a} </option>
						{/each}
					</select>
				</label>

				<h2 class="text-lg font-bold label">Contact (Link)</h2>

				{#each $page.data.config.contacts as c}
					<label class="input-group">
						<span>
							<Icon icon={iconMapper(c[0])} />
						</span>
						<input type="text" bind:value={c[2]} class="input input-bordered w-full" />
					</label>
				{/each}

				<div class="divider" />
				<button class="btn btn-primary" class:loading> Simpan </button>
			</form>
		</div>
	</div>
</div>
