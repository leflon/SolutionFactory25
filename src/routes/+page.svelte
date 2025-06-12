<script lang="ts">
	import '../app.css';
	import { appState } from '$lib/store.svelte';
	import { onMount } from 'svelte';
	import MetroMap from '../components/MetroMap.svelte';
	import ItineraryPane from '../components/ItineraryPane.svelte';

	let error = $state('');
	let displayMST = $state(false);

	onMount(async () => {
		try {
			const res = await fetch('/api/getMap');
			if (!res.ok) throw new Error('Failed to fetch map data');
			const data = await res.json();
			appState.stops = data.stops;
			appState.mapAdjacencyLists = new Map(JSON.parse(data.adjacencyLists));
			appState.minimumSpanningTree = new Map(JSON.parse(data.minimumSpanningTree));
		} catch (e: any) {
			error = e.message;
		}
	});
</script>

{#if error}
	<p style="color: red;">{error}</p>
{:else}
	<div class="app-layout">
		<div class="left-pane">
			<ItineraryPane />
		</div>
		<MetroMap
			map={appState.displayMST ? appState.minimumSpanningTree : appState.mapAdjacencyLists}
			activeItinerary={appState.activeItinerary}
		/>
	</div>
{/if}

<style>
	.app-layout {
		display: flex;
		flex-direction: row;
		gap: 10px;
		padding: 10px 0;
		box-sizing: border-box;
		height: 100dvh;
	}
	.left-pane {
	}
</style>
