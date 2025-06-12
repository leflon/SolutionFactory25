<script lang="ts">
	import { appState } from '$lib/store.svelte';
	import ItineraryBreakdown from './ItineraryBreakdown.svelte';
	import SearchInput from './SearchInput.svelte';

	let canRequestItinerary = $derived(
		appState.itineraryQuery.from !== null && appState.itineraryQuery.to !== null
	);

	let isConnected: boolean | null = $state(null);

	async function handleSearch() {
		if (!canRequestItinerary) return;
		const res = await fetch(
			`/api/getItinerary?start=${appState.itineraryQuery.from}&end=${appState.itineraryQuery.to}`
		);
		const data = await res.json();
		appState.activeItinerary = data.itinerary;
	}
	async function getConnectivity() {
		const res = await fetch('/api/getMetroConnectivity');
		const data = await res.json();
		isConnected = data.isConnected;
	}
</script>

<div class="container">
	<div class="search-container">
		<SearchInput bind:selectedStop={appState.itineraryQuery.from} placeholder="Station de départ" />
		<SearchInput bind:selectedStop={appState.itineraryQuery.to} placeholder={"Station d'arrivée"} />
		{#if canRequestItinerary}
			<button onclick={handleSearch}>Chercher</button>
		{/if}
	</div>
	{#if appState.activeItinerary}
		<ItineraryBreakdown itinerary={appState.activeItinerary} />
	{:else}
		<div class="connectivity">
			<button onclick={getConnectivity}>Vérifier la connectivité du réseau</button>
			<div class="connectivity-status">
				{#if isConnected}
					<p>Le réseau est bien connecté !</p>
				{:else if isConnected === false}
					<p>Le réseau n'est pas connecté</p>
				{/if}
			</div>
		</div>
		<div class="mst">
			<input id="mst" type="checkbox" bind:checked={appState.displayMST} />
			<label for="mst">Afficher l'arbre couvrant minimal</label>
		</div>
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: white;
		border-radius: 5px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		height: 100%;
		overflow: auto;
		width: 350px;
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

	.search-container {
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		padding: 10px;
		background: white;
		z-index: 10;
	}
	p {
		text-align: center;
	}
</style>
