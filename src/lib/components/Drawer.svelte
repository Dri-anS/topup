<script lang="ts">
	import Profile from "$lib/components/Profile.svelte";
	import Icon from "@iconify/svelte";
	import { page, navigating } from "$app/stores";
	import { browser } from "$app/environment";
	$: if ($navigating) {
		const x = document?.querySelector("#menu-drawer") as HTMLInputElement;
		const y = document?.querySelector("label.drawer-overlay") as HTMLButtonElement;
		x?.checked && y?.click();
		document?.querySelector(".drawer-content")?.scrollTo?.({ behavior: "smooth", top: 0 });
	}
</script>

<div class="drawer drawer-mobile">
	<input type="checkbox" id="menu-drawer" class="drawer-toggle" />

	<div class="drawer-content min-h-screen flex flex-col relative">
		<slot />
	</div>

	<div class="drawer-side shadow">
		<label for="menu-drawer" class="drawer-overlay" />
		<div class="w-72 bg-base-100">
			<ul class="menu pt-4">
				<li class="menu-title">
					<span> Navigasi </span>
				</li>
				<li>
					<a href="/invoice">
						<Icon icon="mdi:receipt-text-clock" />
						Invoice
					</a>
				</li>
				<li>
					<a href="/product">
						<Icon icon="mdi:basket" />
						Produk
					</a>
				</li>
				<li class="menu-title">
					<span> Calculator </span>
				</li>
				<li>
					<a href="/calculator/winrate">
						<Icon icon="mdi:percent-outline" />
						Win Rate
					</a>
				</li>
				{#if $page.data.user?.level === "ADMIN"}
					<li class="menu-title">
						<span> Admin </span>
					</li>
					<li>
						<a href="/dashboard/admin/config">
							<Icon icon="mdi:store-cog" />
							Config
						</a>
					</li>
					<li>
						<a href="/dashboard/admin/fee">
							<Icon icon="mdi:currency-usd-circle" />
							Fee
						</a>
					</li>
					<li>
						<a href="/dashboard/admin/profit">
							<Icon icon="mdi:home-currency-usd" />
							Pendapatan
						</a>
					</li>
					<li>
						<a href="/dashboard/admin/account">
							<Icon icon="mdi:account" />
							Akun
						</a>
					</li>
					<li>
						<a href="/dashboard/admin/transaction">
							<Icon icon="mdi:clock-check-outline" />
							Transaksi
						</a>
					</li>
				{/if}
				{#if ["NORMAL", "RESELLER"].includes($page.data.user?.level)}
					<li class="menu-title">
						<span> Member </span>
					</li>
					<li>
						<a href="/dashboard/member/deposit">
							<Icon icon="mdi:cash-plus" />
							Deposit
						</a>
					</li>
				{/if}
			</ul>
			{#if $page.data.user}
				<div class="divider" />
				<div class="stats stats-vertical w-full">
					<div class="stat">
						<span class="stat-title"> Saldo </span>
						<span class="stat-value">Rp. {$page.data.user.balance.toLocaleString("id-ID")} </span>
					</div>
					{#if $page.data.user?.level === "ADMIN"}
						<div class="stat">
							<span class="stat-title"> Saldo Digiflazz </span>
							<span class="stat-value"
								>Rp. {$page.data.adminBalance?.toLocaleString("id-ID")}
							</span>
						</div>
					{/if}
				</div>
			{/if}
			<div class="divider" />
			<Profile />
			<div class="divider mb-32" />
		</div>
	</div>
</div>
