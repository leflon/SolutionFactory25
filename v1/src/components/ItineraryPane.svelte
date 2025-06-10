<script lang="ts">
	import { appState } from '$lib/store.svelte';
	import SearchInput from './SearchInput.svelte';

	let canRequestItinerary = $derived(
		appState.itineraryQuery.from !== null && appState.itineraryQuery.to !== null
	);

	async function handleSearch() {
		if (!canRequestItinerary) return;
		const res = await fetch(
			`/api/getItinerary?start=${appState.itineraryQuery.from}&end=${appState.itineraryQuery.to}`
		);
		const data = await res.json();
		appState.activeItinerary = data.itinerary;
	}
</script>

<div class="container">
	<SearchInput bind:selectedStop={appState.itineraryQuery.from} placeholder="Station de départ" />
	<SearchInput bind:selectedStop={appState.itineraryQuery.to} placeholder={"Station d'arrivée"} />
	{#if canRequestItinerary}
		<button onclick={handleSearch}>Chercher</button>
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		background-color: white;
		padding: 10px;
		border-radius: 5px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		gap: 10px;
		height: 100%;
	}
	button {
		background-color: #007bff;
		color: white;
		border: none;
		padding: 5px 10px;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}
</style>
