<script lang="ts">
	import { persist } from "$lib/store";
	import { browser } from "$app/environment";
	import Icon from "@iconify/svelte";
	const usernameStore = persist<
		{
			game: string;
			user: string;
			zone: string;
			username: string;
			c: number;
		}[]
	>("game-username-2", []);
	const gameWithZone = ["ML"];
	export let lookup: boolean = false;
	export let game: string;
	export let user: string = "";
	export let zone: string = "";
	export let username: string = "";
	export let customerNo = user + zone;
	export let withZone = gameWithZone.includes(game);

	$: customerNo = user + zone;
	$: if (username) {
		setUsername();
	}

	$: if (user || zone) {
		resetUsername();
	}

	let loading = false;

	function resetUsername() {
		username = "";
	}

	function setUsername() {
		const s = $usernameStore.find((ss) => {
			return ss.game === game && ss.username === username;
		});
		if (s) {
			user = s.user;
			zone = s.zone;
		}
	}

	async function check(user: string, zone: string) {
		try {
			loading = true;
			const s = $usernameStore.find((ss) => {
				return ss.game === game && ss.user === user && ss.zone === zone;
			});
			if (s && s.c % 30 < 29) {
				s.c++;
				await new Promise((r) => {
					setTimeout(r, 300);
				});
				username = s.username;
				return;
			}
			const url = new URL("/api/lookup", new URL(window.location.href));
			url.searchParams.set("game", game);
			url.searchParams.set("userId", user);
			if (withZone) {
				url.searchParams.set("zoneId", zone);
			}
			const res = await fetch(url.href);
			if (!res.ok) {
				throw new Error("failed to get username");
			}
			const json = await res.json();
			if (!s) {
				$usernameStore = [
					...$usernameStore,
					{
						game,
						user,
						zone,
						username: json.data,
						c: 0
					}
				];
			}
			if ($usernameStore.length > 1e3) {
				$usernameStore = $usernameStore.sort((a, b) => a - b);
				$usernameStore = $usernameStore.slice(100);
			}
			username = json.data;
		} finally {
			loading = false;
		}
	}
</script>

<input type="text" name="customerNo" class="hidden" value={customerNo} />
<div class="form-control">
	<label class="input-group">
		<span>
			<Icon icon="mdi:account" />
		</span>
		<input
			type="text"
			class="input w-full input-bordered"
			list="username"
			bind:value={username}
			disabled={!browser || !$usernameStore.some((s) => s.game === game)}
		/>
	</label>

	<div class="divider" />

	<label class="label"> User ID </label>
	<input
		bind:value={user}
		placeholder="User ID"
		type="number"
		class="input input-bordered"
		disabled={!browser}
	/>

	{#if withZone}
		<label class="label"> Zone ID </label>
		<input
			bind:value={zone}
			placeholder="Zone ID"
			type="number"
			class="input input-bordered"
			disabled={!browser}
		/>
	{/if}

	<button
		class="btn btn-primary mt-4"
		on:click={() => check(user, zone)}
		disabled={!user || (withZone && !zone) || loading}
	>
		Check
	</button>
</div>

<datalist id="username">
	{#each $usernameStore
		.filter((s) => !!s.username)
		.sort((a, b) => a.c - b.c)
		.map((s) => s.username)
		.filter((s) => s.startsWith(username))
		.slice(0, 10) as i (i)}
		<option value={i} />
	{/each}
</datalist>
