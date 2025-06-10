<script lang="ts">
	import type { Link, Path, Stop } from '$lib/types';
	import SearchInput from '../components/SearchInput.svelte';
	import { onMount } from 'svelte';
	let stops: Stop[] = $state([]);
	let links: Link[] = $state([]);
	let error = $state('');
	// svelte-ignore non_reactive_update
	let canvas: HTMLCanvasElement;
	let search = $state<[number | null, number | null]>([null, null]);
	let selectedPath: Path | null = $state(null);

	async function handleSearch() {
		if (search[0] === null || search[1] === null) return;
		const res = await fetch(`/api/getRoute?start=${search[0]}&end=${search[1]}`);
		const data = await res.json();
		selectedPath = data.path;
		drawPath();
	}

	function drawPath() {
		if (!selectedPath || !canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const img = new Image();
		img.src = '/map.png';
		img.onload = () => {
			ctx.drawImage(img, 0, 0);
			ctx.beginPath();
			ctx.moveTo(stops[selectedPath![0][0]].pos_x, stops[selectedPath![0][0]].pos_y);
			selectedPath![0].forEach((stopId) => {
				const stop = stops[stopId];
				ctx.lineTo(stop.pos_x, stop.pos_y);
			});
			ctx.strokeStyle = 'red';
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.closePath();
		};
		img.onerror = () => {
			error = 'Failed to load map image';
		};
	}

	onMount(async () => {
		try {
			const res = await fetch('/api/getMap');
			if (!res.ok) throw new Error('Failed to fetch map data');
			const data = await res.json();
			stops = data.stops;
			links = data.links;
		} catch (e: any) {
			error = e.message;
		}

		const ctx = canvas!.getContext('2d');
		if (!ctx) {
			error = 'Failed to get canvas context';
			return;
		}
		const img = new Image();
		img.src = '/map.png';
		img.onload = () => {
			ctx.drawImage(img, 0, 0);
			stops.forEach((stop) => {
				ctx.beginPath();
				ctx.arc(stop.pos_x, stop.pos_y, 3, 0, Math.PI * 2);
				ctx.fillStyle = 'black';
				ctx.fill();
				ctx.closePath();
			});
		};
		img.onerror = () => {
			error = 'Failed to load map image';
		};
	});
</script>

{#if error}
	<p style="color: red;">{error}</p>
{:else}
	<div class="left-pane">
		<div class="search-pane">
			<SearchInput {stops} bind:selectedStop={search[0]} placeholder="Station de départ" />
			<SearchInput {stops} bind:selectedStop={search[1]} placeholder={"Station d'arrivée"} />
			{#if search[0] !== null && search[1] !== null}
				<button onclick={handleSearch}>Chercher</button>
			{/if}
		</div>
	</div>
	<canvas bind:this={canvas} width="987" height="952"></canvas>
{/if}

<style>
	.left-pane {
		position: absolute;
		top: 10px;
		left: 10px;
		z-index: 1000;
		background-color: white;
		padding: 10px;
		border-radius: 5px;
		width: 200px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.search-pane {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	canvas {
		border: 1px solid #ccc;
		display: block;
		margin: 0 auto;
		max-width: 50%;
	}
</style>
