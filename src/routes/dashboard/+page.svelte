<script lang="ts">
	import { page } from "$app/stores";
</script>

<div class="p-2 bg-base-100 flex-auto">
	<h1 class="text-4xl font-bold">Dashboard</h1>

	<div class="card">
		<div class="card-body">
			<h2 class="card-title">Admin</h2>
			<a class="btn btn-primary btn-outline" href="/dashboard/admin/fee"> Fee </a>
			<a class="btn btn-primary btn-outline" href="/dashboard/admin/config"> Config </a>
		</div>
	</div>
</div>
