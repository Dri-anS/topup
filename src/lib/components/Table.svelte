<script lang="ts" context="module">
</script>

<script lang="ts">
	import Icon from "@iconify/svelte";
	import { string } from "zod";

	export let items: Record<string, unknown>[] = [];
	export let columns: null | Record<string, string> = null;
	export let rowNumber = false;
	export let additionalColumns = [] as string[];
	export let filterable = [] as string[];
	export let compact = false;
	export let tabs = false;
	export let noOmit = [] as string[];

	let searchTerm = "";
	let filter = {} as Record<string, string>;
	let page = 1;
	let perPage = 10;
	$: filteredItems = filterItems(items, filter, page, perPage);
	$: maxPage = Math.ceil(filteredItems.length / perPage);
	$: if (filter) {
		page = 1;
	}

	function paginate(items: Record<string, unknown>[], page: number, perPage: number) {
		return Array.from(items)
			.slice(page * perPage - perPage)
			.slice(0, perPage);
	}

	function getOptions(items: Record<string, unknown>[], key: string) {
		const opts = items.map((i) => i[key]);
		return [...new Set(opts)] as string[];
	}

	function filterItems(
		items: Record<string, unknown>[],
		filter: Record<string, unknown>,
		page: number,
		perPage: number
	) {
		return items.filter((i) => {
			for (const [k, v] of Object.entries(filter)) {
				if (!v || !i[k]) {
					continue;
				}
				if ((i[k] as string).toString() !== v.toString()) {
					return false;
				}
			}
			return true;
		});
	}
</script>

<div class="flex flex-col">
	{#if filterable.length}
		<form on:submit|preventDefault class="form-control">
			{#each Object.keys(columns || items[0] || {}) as k}
				{@const _ = filter[k] ||= ""}
				{#if filterable.includes(k)}
					{#if tabs}
						<label class="label capitalize">{columns?.[k] || k}</label>
						<div class="tabs tabs-boxed">
							{#each getOptions(noOmit.includes(k) ? items : filteredItems, k).sort() as value}
								<button
									class="tab capitalize"
									class:tab-active={filter[k] === value}
									on:click={() => {
										if (noOmit.includes(k)) {
											filter = {};
										}
										filter[k] = value;
									}}
								>
									{value}
								</button>
							{/each}
						</div>
					{:else}
						<label class="label capitalize">{columns?.[k] || k}</label>
						<select class="select select-bordered select-sm" bind:value={filter[k]}>
							<option value="" selected> {columns?.[k] || k} </option>
							{#each getOptions(filteredItems, k).sort() as value}
								<option {value}> {value} </option>
							{/each}
						</select>
					{/if}
				{/if}
			{/each}
			<button class="btn btn-sm btn-warning mt-4" on:click={() => (filter = {})}>clear</button>
		</form>
		<div class="divider" />
	{/if}
	<div class="overflow-x-auto shadow">
		<table class="table w-full table-zebra" class:table-compact={compact}>
			<thead>
				<slot name="header">
					<tr>
						{#if rowNumber}
							<th />
						{/if}
						{#each Object.keys(columns || items[0] || {}) as k (k)}
							<slot name="header-col" {k}>
								<td> {columns?.[k] || k} </td>
							</slot>
						{/each}
						{#each additionalColumns as c (c)}
							<td> {c} </td>
						{/each}
					</tr>
				</slot>
			</thead>
			<tbody>
				{#each paginate(filteredItems, page, perPage) as item, i}
					<tr>
						{#if rowNumber}
							<th> {i + 1} </th>
						{/if}
						{#each Object.keys(columns || items[0] || {}) as key (key + i)}
							{@const value = item[key]}
							<slot {item} {key} {value} name="column">
								{#if typeof value === "number" || value instanceof Date}
									<td> {value.toLocaleString("id-ID")} </td>
								{:else}
									<td> {value} </td>
								{/if}
							</slot>
						{/each}
						<slot name="additional" {item} />
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div class="btn-group mx-auto mt-4">
		<slot name="button">
			<button class="btn btn-sm" on:click={() => (page = Math.max(page - 1, 1))}>
				<Icon icon="mdi:arrow-left-thin" />
			</button>
			<button
				class="btn btn-sm"
				on:click={() => {
					page--;
				}}
				disabled={page - 1 <= 0}
			>
				{page - 1}
			</button>
			<button class="btn btn-sm btn-info" on:click={() => {}}>
				{page}
			</button>
			<button
				class="btn btn-sm"
				on:click={() => {
					page++;
				}}
				disabled={page + 1 > maxPage}
			>
				{page + 1}
			</button>
			<button class="btn btn-sm" on:click={() => (page = Math.min(page + 1, maxPage))}>
				<Icon icon="mdi:arrow-right-thin" />
			</button>
		</slot>
	</div>
</div>
