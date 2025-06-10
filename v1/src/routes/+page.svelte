<script lang="ts">
	import type { Link, Path, Stop } from '$lib/types';
	import { onMount } from 'svelte';
	let stops: Stop[] = [];
	let links: Link[] = [];
	let example: Path = [[], []];
	let error = '';
	let canvas: HTMLCanvasElement;

	onMount(async () => {
		try {
			const res = await fetch('/api/getMap');
			if (!res.ok) throw new Error('Failed to fetch map data');
			const data = await res.json();
			stops = data.stops;
			links = data.links;
			example = data.example;
			console.log(example);
			console.log(example[0].map((i) => stops[i].plain_name));
		} catch (e: any) {
			error = e.message;
		}

		const ctx = canvas.getContext('2d');
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
			ctx.beginPath();
			example[0].forEach((stopIndex, i) => {
				const stop = stops[stopIndex];
				console.log(stop.plain_name, stop.id, i);
				if (i === 0) ctx.moveTo(stop.pos_x, stop.pos_y);
				else ctx.lineTo(stop.pos_x, stop.pos_y);
				ctx.arc(stop.pos_x, stop.pos_y, 3, 0, Math.PI * 2);
			});
			ctx.strokeStyle = 'blue';
			ctx.lineWidth = 2;
			ctx.closePath();
			ctx.stroke();
		};
		img.onerror = () => {
			error = 'Failed to load map image';
		};
	});
</script>

{#if error}
	<p style="color: red;">{error}</p>
{:else}
	<canvas bind:this={canvas} width="987" height="952"></canvas>
{/if}

<style>
	canvas {
		border: 1px solid #ccc;
		display: block;
		margin: 0 auto;
		max-width: 50%;
	}
</style>
