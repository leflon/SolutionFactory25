<script lang="ts">
	import type { Stop } from '$lib/types';
	import { Search } from '@lucide/svelte';

	interface Props {
		stops: Stop[];
		placeholder: string;
		selectedStop: number | null;
	}
	let { stops, placeholder, selectedStop = $bindable() }: Props = $props();

	let searchTerm: string = $state('');
	let searchResults: number[] = $state([]);
	let showResults: boolean = $state(false);

	$effect(() => {
		if (selectedStop !== null && selectedStop >= 0 && selectedStop < stops.length)
			searchTerm = stops[selectedStop].name;
	});
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

	const handleSelection = (stop: number) => {
		selectedStop = stop;
		showResults = false;
		searchTerm = stops[selectedStop].name;
	};

	const handleFocus = () => {
		showResults = true;
	};
	const handleBlur = () => {
		setTimeout(() => {
			//showResults = false;
		}, 100);
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
		<ul>
			{#each searchResults as result}
				<li onclick={() => handleSelection(result)}>{stops[result].name}</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.seach-container {
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
	}

	button {
		border: none;
		background-color: #007bff;
		color: white;
		border-radius: 10em;
		width: 32px;
		height: 32px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}

	ul {
		position: absolute;
		transform: translateY(5px);
		width: 100%;
		list-style: none;
		margin: 0;
		padding: 0;
		background-color: white;
		border: 1px solid #ccc;
		border-radius: 4px;
		max-height: 200px;
		overflow-y: auto;
	}
	li {
		padding: 8px;
		cursor: pointer;
		&:hover {
			background-color: #eee;
		}
	}
</style>
