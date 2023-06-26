<script lang="ts" context="module">
	export function iconMapper(icon: string) {
		const icons = {
			telegram: "mdi:telegram",
			facebook: "mdi:facebook",
			whatsapp: "mdi:whatsapp",
			discord: "mdi:discord",
			instagram: "mdi:instagram",
			email: "mdi:email",
			line: "simple-icons:line"
		} as Record<string, string>;

		return icons[icon] || icon;
	}
</script>

<script lang="ts">
	import Icon from "@iconify/svelte";
	import { page } from "$app/stores";
	import type { TypeOf } from "zod";
	let contacts: [string, string, string][];
	$: contacts = $page.data.config.contacts || [];
	$: contacts = contacts.filter((c) => !!c[2].split("#")[0]);
</script>

<footer class="footer bg-neutral-focus text-neutral-content p-8 flex flex-col">
	<div>
		<span class="footer-title underline"> Contact Me </span>
		<ul>
			{#each contacts as [icon, text, href] (href + text)}
				<li>
					<a
						{href}
						class="flex flex-row items-center space-x-1 capitalize"
						target="_blank"
						on:click={(e) => {
							if (href === "#") {
								e.preventDefault();
							}
						}}
					>
						<Icon icon={iconMapper(icon)} />
						<span> {text} </span>
					</a>
				</li>
			{/each}
		</ul>
	</div>

	<div>
		<span class="footer-title underline"> Legal </span>
	</div>

	<div>
		<p>Copyright &copy; 2023 {$page.data.config.owner} - All right reserved</p>
	</div>
	<div class="divider mt-0" />
</footer>
