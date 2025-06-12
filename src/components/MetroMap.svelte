<script lang="ts">
	import { LINE_COLORS } from '$lib/constants';
	import { appState } from '$lib/store.svelte';
	import type { AdjacencyLists, Itinerary } from '$lib/types';
	import { ZoomIn, ZoomOut } from '@lucide/svelte';

	interface Props {
		map: AdjacencyLists;
		activeItinerary?: Itinerary | null;
	}

	let { map, activeItinerary }: Props = $props();

	// DOM element references
	let hoverStopLabel: HTMLDivElement;
	let mapContainerSvg: SVGSVGElement;
	let dynamicMapSvg: SVGGElement;

	/**
	 * Draws the metro map by creating SVG elements for lines and stops
	 * Lines connect adjacent stops on the same line
	 * Stops are represented as interactive circles
	 */
	function drawMap() {
		dynamicMapSvg.innerHTML = ''; // Clear previous content

		// Draw connecting lines between stops
		for (const [fromId, adjancentNodes] of map.entries()) {
			const from = appState.stops.find((s) => s.id === fromId);
			if (!from) continue;

			for (const [toId, duration] of adjancentNodes) {
				const to = appState.stops.find((s) => s.id === toId);
				if (!to || from.line !== to.line) continue;

				const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				line.setAttribute('data-stop1', from.id.toString());
				line.setAttribute('data-stop2', to.id.toString());
				line.setAttribute('data-duration', duration.toString());
				line.setAttribute('x1', from.position.x.toString());
				line.setAttribute('y1', from.position.y.toString());
				line.setAttribute('x2', to.position.x.toString());
				line.setAttribute('y2', to.position.y.toString());
				line.setAttribute('stroke', LINE_COLORS[from.line] || 'black');
				line.setAttribute('stroke-width', '3');

				// Line hover interaction showcasing stops and duration
				line.addEventListener('mouseenter', () => {
					hoverStopLabel.textContent = `${from.name} - ${to.name} (${duration}s)`;
					hoverStopLabel.classList.remove('hidden');
				});
				line.addEventListener('mousemove', (e) => {
					hoverStopLabel.style.left = `${e.clientX}px`;
					hoverStopLabel.style.top = `${e.clientY}px`;
				});
				line.addEventListener('mouseleave', () => {
					hoverStopLabel.classList.add('hidden');
				});

				dynamicMapSvg.appendChild(line);
			}
		}

		// Draw all stops as interactive circles, above lines
		for (const stop of appState.stops) {
			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle.setAttribute('cx', stop.position.x.toString());
			circle.setAttribute('cy', stop.position.y.toString());
			circle.setAttribute('r', '5');
			circle.setAttribute('fill', LINE_COLORS[stop.line] || 'black');
			circle.setAttribute('data-stop-id', stop.id.toString());
			circle.setAttribute('class', 'stop');

			// Handle stop click for itinerary selection
			circle.addEventListener('click', () => {
				const stopId = parseInt(circle.getAttribute('data-stop-id') || '0', 10);
				if (appState.itineraryQuery.from === null) appState.itineraryQuery.from = stopId;
				else if (appState.itineraryQuery.to === null) appState.itineraryQuery.to = stopId;
				else appState.itineraryQuery = { from: stopId, to: null };
			});

			// Handle stop hover interactions
			const moveStopLabel = (x: number, y: number) => {
				hoverStopLabel.style.left = `${x}px`;
				hoverStopLabel.style.top = `${y}px`;
			};

			circle.addEventListener('mouseenter', (e) => {
				hoverStopLabel.textContent = stop.name;
				moveStopLabel(e.clientX, e.clientY);
				hoverStopLabel.classList.remove('hidden');
			});
			circle.addEventListener('mousemove', (e) => moveStopLabel(e.clientX, e.clientY));
			circle.addEventListener('mouseleave', () => hoverStopLabel.classList.add('hidden'));

			dynamicMapSvg.appendChild(circle);
		}
	}

	/**
	 * Resets all map elements to their default state
	 * Removes path highlighting and animations
	 */
	function resetMapStyles() {
		// Reset path lines
		const pathLines = document.querySelectorAll<SVGLineElement>('line');
		pathLines.forEach((line) => {
			line.classList.remove('path-line');
			line.setAttribute('opacity', '1');
		});

		// Reset stops
		const allStops = document.querySelectorAll<SVGCircleElement>('circle.stop');
		allStops.forEach((stop) => {
			stop.classList.remove('path-stop');
			stop.style.animationDelay = '';
			stop.style.animationDuration = '';
			stop.setAttribute('opacity', '1');
		});
	}

	/**
	 * Highlights the active itinerary path on the map
	 * Animates stops and dims non-path elements
	 */
	function drawPath() {
		if (!activeItinerary) return;

		// Animate stops in the current route
		const stops = activeItinerary.stops.map((s) =>
			document.querySelector(`circle[data-stop-id="${s}"]`)
		) as SVGCircleElement[];
		const duration = Math.max(2, stops.length * 0.1);
		let delay = 0;

		for (const stop of stops) {
			stop!.classList.add('path-stop');
			stop!.style.animationDelay = `${delay}s`;
			stop!.style.animationDuration = `${duration}s`;
			dynamicMapSvg.appendChild(stop); // Ensure stop is on top layer
			delay += 0.1;
		}

		// Dim non-path stops
		const otherStops = document.querySelectorAll<SVGCircleElement>('circle.stop:not(.path-stop)');
		otherStops.forEach((stop) => stop.setAttribute('opacity', '0.5'));

		// Highlight path lines
		const pathLines = document.querySelectorAll<SVGLineElement>('line[data-stop1][data-stop2]');
		for (const line of pathLines) {
			const stop1Id = parseInt(line.getAttribute('data-stop1') || '0', 10);
			const stop2Id = parseInt(line.getAttribute('data-stop2') || '0', 10);

			if (activeItinerary.stops.includes(stop1Id) && activeItinerary.stops.includes(stop2Id)) {
				const length = Math.sqrt(
					Math.pow(
						parseFloat(line.getAttribute('x2') || '0') - parseFloat(line.getAttribute('x1') || '0'),
						2
					) +
						Math.pow(
							parseFloat(line.getAttribute('y2') || '0') - parseFloat(line.getAttribute('y1') || '0'),
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

	// Redraw or reset map based on props and app state
	$effect(() => {
		if (appState.stops && map) drawMap();
		if (activeItinerary) drawPath();
		else resetMapStyles();
	});
</script>

<div class="map-container">
	<div class="map-controls">
		<button onmousedown={() => zoom(10)}><ZoomIn /></button>
		<button onmousedown={() => zoom(-10)}><ZoomOut /></button>
	</div>
	<svg viewBox="0 0 987 952" bind:this={mapContainerSvg}>
		<rect x="0" y="0" width="987" height="952" fill="#f0f0f0" />
		<image href="/map.png" x="0" y="0" width="987" height="952" opacity="0.2" />
		<g id="interactive-map" bind:this={dynamicMapSvg}>
			<!-- Dynamic map elements will be added here -->
		</g>
	</svg>
	<div class="hover-stop-label hidden" bind:this={hoverStopLabel}></div>
</div>

<style>
	/* Map container and controls */
	.map-container {
		position: relative;
	}

	.map-controls {
		position: absolute;
		top: 10px;
		right: 10px;
		display: flex;
		flex-direction: column;
		gap: 5px;
		z-index: 1000;
	}

	svg {
		height: 100%;
		width: 800px;
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
