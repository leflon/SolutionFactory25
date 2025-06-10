<script lang="ts">
	import { LINE_COLORS } from '$lib/constants';
	import type { Link, Path, Stop } from '$lib/types';
	import SearchInput from '../components/SearchInput.svelte';
	import { onMount } from 'svelte';
	let stops: Stop[] = $state([]);
	let links: Link[] = $state([]);
	let error = $state('');
	// svelte-ignore non_reactive_update
	let mapContainer: SVGElement;
	// svelte-ignore non_reactive_update
	let hoverStopLabel: HTMLDivElement;
	let search = $state<[number | null, number | null]>([null, null]);
	let selectedPath: Path | null = $state(null);

	async function handleSearch() {
		if (search[0] === null || search[1] === null) return;
		const res = await fetch(`/api/getRoute?start=${search[0]}&end=${search[1]}`);
		const data = await res.json();
		selectedPath = data.path;
		drawPath();
	}

	function resetMapStyles() {
		// Reset all path lines
		const pathLines = document.querySelectorAll<SVGLineElement>('line');
		pathLines.forEach((line) => {
			line.classList.remove('path-line');
			line.setAttribute('opacity', '1');
		});
		// Reset all stops
		const allStops = document.querySelectorAll<SVGCircleElement>('circle.stop');
		allStops.forEach((stop) => {
			stop.classList.remove('path-stop');
			stop.style.animationDelay = '';
			stop.style.animationDuration = '';
			stop.setAttribute('opacity', '1');
		});
	}

	function drawPath() {
		if (!selectedPath) return;
		resetMapStyles();
		// Bounce stops in the current route
		const stops = selectedPath[0].map((s) =>
			document.querySelector(`circle[data-stop-id="${s}"]`)
		) as SVGCircleElement[];
		const duration = Math.max(2, stops.length * 0.1);
		let delay = 0;
		for (const stop of stops) {
			stop!.classList.add('path-stop');
			stop!.style.animationDelay = `${delay}s`;
			stop!.style.animationDuration = `${duration}s`;
			mapContainer.appendChild(stop); // Moves the stop to the end of the SVG to ensure it is on top
			delay += 0.1;
		}

		// Dim other stops
		const otherStops = document.querySelectorAll<SVGCircleElement>('circle.stop:not(.path-stop)');
		otherStops.forEach((stop) => stop.setAttribute('opacity', '0.5'));

		// Highlight path lines
		const pathLines = document.querySelectorAll<SVGLineElement>('line[data-stop1][data-stop2]');
		for (const line of pathLines) {
			const stop1Id = parseInt(line.getAttribute('data-stop1') || '0', 10);
			const stop2Id = parseInt(line.getAttribute('data-stop2') || '0', 10);
			if (selectedPath[0].includes(stop1Id) && selectedPath[0].includes(stop2Id)) {
				const length = Math.sqrt(
					Math.pow(
						parseFloat(line.getAttribute('x2') || '0') - parseFloat(line.getAttribute('x1') || '0'),
						2
					) +
						Math.pow(
							parseFloat(line.getAttribute('y2') || '0') -
								parseFloat(line.getAttribute('y1') || '0'),
							2
						)
				);
				line.style.setProperty('--line-length', `${length}`);
				line.classList.add('path-line');
			} else {
				line.setAttribute('opacity', '0.2');
			}
		}
	}

	onMount(async () => {
		try {
			const res = await fetch('/api/getMap');
			if (!res.ok) throw new Error('Failed to fetch map data');
			const data = await res.json();
			stops = data.stops;
			links = data.links;
			// Draw all links between stops
			for (const link of links) {
				const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				const stop1 = stops.find((s) => s.id === link.stop1);
				const stop2 = stops.find((s) => s.id === link.stop2);
				if (!stop1 || !stop2) continue; // Skip if stops are not found
				if (stop1.line !== stop2.line) continue;
				line.setAttribute('data-stop1', stop1.id.toString());
				line.setAttribute('data-stop2', stop2.id.toString());
				line.setAttribute('x1', stop1.pos_x.toString());
				line.setAttribute('y1', stop1.pos_y.toString());
				line.setAttribute('x2', stop2.pos_x.toString());
				line.setAttribute('y2', stop2.pos_y.toString());
				line.setAttribute('stroke', LINE_COLORS[stop1.line] || 'black');
				line.setAttribute('stroke-width', '3');
				mapContainer.appendChild(line);
			}
			// Draw all stops as circles
			for (const stop of stops) {
				const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				circle.setAttribute('cx', stop.pos_x.toString());
				circle.setAttribute('cy', stop.pos_y.toString());
				circle.setAttribute('r', '5');
				circle.setAttribute('fill', LINE_COLORS[stop.line] || 'black');
				circle.setAttribute('data-stop-id', stop.id.toString());
				circle.setAttribute('class', 'stop');
				/* Stops interaction */
				circle.addEventListener('click', () => {
					const stopId = parseInt(circle.getAttribute('data-stop-id') || '0', 10);
					if (search[0] === null) search[0] = stopId;
					else if (search[1] === null) search[1] = stopId;
					else search = [stopId, null];
				});
				function moveStopLabel(x: number, y: number) {
					hoverStopLabel.style.left = `${x}px`;
					hoverStopLabel.style.top = `${y}px`;
				}
				circle.addEventListener('mouseenter', (e) => {
					hoverStopLabel.textContent = stop.name;
					moveStopLabel(e.clientX, e.clientY);
					hoverStopLabel.classList.remove('hidden');
				});
				circle.addEventListener('mousemove', (e) => {
					moveStopLabel(e.clientX, e.clientY);
				});
				circle.addEventListener('mouseleave', () => {
					hoverStopLabel.classList.add('hidden');
				});
				mapContainer.appendChild(circle);
			}
		} catch (e: any) {
			error = e.message;
		}
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
	<div class="map-container">
		<svg
			bind:this={mapContainer}
			viewBox="0 0 987 952"
			height="100vh"
			preserveAspectRatio="xMidYMid meet"
		>
			<rect x="0" y="0" width="100%" height="100%" fill="#f0f0f0"></rect>
			<image
				href="/map.png"
				x="0"
				y="0"
				width="100%"
				height="100%"
				opacity="0.2"
				preserveAspectRatio="xMidYMid meet"
			/>
		</svg>
		<div class="hover-stop-label hidden" bind:this={hoverStopLabel}></div>
	</div>
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

	.map-container {
		position: relative;
	}

	.hover-stop-label {
		position: fixed;
		background-color: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 5px 10px;
		border-radius: 5px;
		pointer-events: none;
		font: 14px Arial;
		transition: opacity 0.1s ease;
		transform: translate(-50%, -105%);
		z-index: 1001;
	}
	.hover-stop-label.hidden {
		opacity: 0;
		pointer-events: none;
	}
	:global(circle.stop) {
		cursor: pointer;
	}
	:global(circle.path-stop) {
		z-index: 1000;
		animation: bounce 1s ease infinite;
	}
	:global(text.stop-label.hidden) {
		opacity: 0;
		pointer-events: none;
	}

	@keyframes bounce {
		50% {
			r: 8;
			z: 1001;
		}
	}
</style>
