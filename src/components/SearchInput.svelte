<script lang="ts">
	import { appState } from '$lib/store.svelte';
	import { Search } from '@lucide/svelte';

	interface Props {
		placeholder: string;
		selectedStop: number | null;
	}

	let { placeholder, selectedStop = $bindable() }: Props = $props();

	// Component state
	let searchTerm: string = $state('');
	let searchResults: number[] = $state([]);
	let showResults: boolean = $state(false);

	/**
	 * Updates search term when selected stop changes
	 */
	$effect(() => {
		if (selectedStop !== null && selectedStop >= 0 && selectedStop < appState.stops.length)
			searchTerm = appState.stops[selectedStop].name;
		if (selectedStop === null) searchTerm = '';
	});

	/**
	 * Handles search input changes and fetches matching stops
	 * @param event Input event from search field
	 */
	async function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchTerm = target.value;

		if (searchTerm.length === 0) {
			searchResults = [];
			return;
		}

		const res = await fetch(`/api/searchStops?name=${searchTerm}`);
		const data = await res.json();
		searchResults = data.stops.map((stop: string) => parseInt(stop, 10));
	}

	/**
	 * Handles stop selection from search results
	 * @param stop Selected stop ID
	 */
	const handleSelection = (stop: number) => {
		selectedStop = stop;
		showResults = false;
		searchTerm = appState.stops[selectedStop].name;
	};

	/**
	 * Shows search results when input is focused
	 */
	const handleFocus = () => {
		showResults = true;
	};

	/**
	 * Handles input blur event
	 * Note: Results visibility is managed by click events instead
	 */
	const handleBlur = () => {
		// Results visibility is managed by click events
	};
</script>

<div class="search-container">
	<div class="search-input">
		<input
			type="search"
			bind:value={searchTerm}
			oninput={handleInput}
			onfocus={handleFocus}
			onblur={handleBlur}
			placeholder={placeholder || 'Search...'}
			aria-label="Search"
		/>
		<button type="submit"><Search size={16} /></button>
	</div>

	{#if searchResults.length > 0 && showResults}
		<ul class="search-results">
			{#each searchResults as result}
				<li>
					<button type="button" onclick={() => handleSelection(result)}>
						{appState.stops[result].name}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.search-container {
		position: relative;
		width: 100%;
		margin: 0 auto;
	}
	
	.search-input {
		display: flex;
		gap: 8px;
	}

	input[type='search'] {
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 10em;
		flex-grow: 1;
		font-size: 12px;
		width: 200px;
	}

	button[type='submit'] {
		border: none;
		background-color: #007bff;
		color: white;
		border-radius: 10em;
		width: 32px;
		height: 32px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	button[type='submit']:hover {
		background-color: #0056b3;
	}

	/* Search results styling */
	.search-results {
		border-radius: 5px;
		z-index: 1000;
		position: absolute;
		transform: translateY(5px);
		width: 100%;
		list-style: none;
		margin: 0;
		padding: 0;
		background-color: white;
		border: 1px solid #ccc;
		overflow-x: hidden;
		overflow-y: auto;
		max-height: 300px;
	}

	.search-results li {
		padding: 8px;
	}

	.search-results li:hover {
		background-color: #eee;
	}

	.search-results li button {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		font: inherit;
		color: inherit;
		text-align: left;
		width: 100%;
		cursor: pointer;
	}
</style>
