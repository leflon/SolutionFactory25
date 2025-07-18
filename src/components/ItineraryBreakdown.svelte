<script lang="ts">
	import { LINE_COLORS } from '$lib/constants';
	import { appState } from '$lib/store.svelte';
	import type { Itinerary, Stop } from '$lib/types';
	import { ArrowRight, X } from '@lucide/svelte';

	interface Props {
		itinerary: Itinerary;
	}

	let { itinerary }: Props = $props();

	/**
	 * Formats a duration in seconds to a human-readable string
	 * @param duration Duration in seconds
	 * @returns Formatted duration string (e.g. "2h 30 min" or "45 min")
	 */
	const formatDuration = (duration: number): string => {
		const hours = Math.floor(duration / 3600);
		const minutes = Math.floor((duration % 3600) / 60);
		return hours > 0 ? `${hours}h ${minutes} min` : `${minutes} min`;
	};

	/**
	 * Computed breakdown of the itinerary by metro line
	 * Groups stops and durations by line for better visualization
	 */
	let breakdown = $derived.by(() => {
		const result: { line: string; stops: Stop[]; duration: number }[] = [];

		for (let i = 0; i < itinerary.stops.length; i++) {
			const stopId = itinerary.stops[i];
			const duration = itinerary.durations[i];
			const stop = appState.stops.find((s) => s.id === stopId);
			if (!stop) continue;

			const part = result.find((r) => r.line === stop.line);
			if (part) {
				part.stops.push(stop);
				part.duration += duration;
			} else {
				result.push({ line: stop.line, stops: [stop], duration });
			}
		}

		return result;
	});

	/**
	 * Clears the current itinerary and resets search query
	 */
	const onClose = () => {
		appState.activeItinerary = null;
		appState.itineraryQuery = { from: null, to: null };
	};
</script>

<div class="breakdown-container">
	<!-- Header section with total duration and line sequence -->
	<div class="breakdown-header">
		<button class="close-button" onclick={onClose}>
			<X />
		</button>
		<h2>Itinéraire</h2>
		<div class="header-duration">
			{formatDuration(breakdown.reduce((acc, curr) => acc + curr.duration, 0))}
		</div>
		<div class="header-lines">
			{#each breakdown.map((part) => part.line) as line, i}
				<span class="line-number" style={'--line-color:' + LINE_COLORS[line]}>{line}</span>
				{#if i < breakdown.length - 1}
					<span class="line-separator">
						<ArrowRight />
					</span>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Detailed breakdown of each line segment -->
	{#each breakdown as part, i}
		{#if i > 0 && i < breakdown.length}
			<div class="connection-indicator">
				<div class="line-number" style={'--line-color:' + LINE_COLORS[breakdown[i - 1].line]}>
					{breakdown[i - 1].line}
				</div>
				<div>Correspondance</div>
				<div class="line-number" style={'--line-color:' + LINE_COLORS[part.line]}>{part.line}</div>
			</div>
		{/if}
		<div class="breakdown-part">
			<div class="stops-list">
				<div class="left-line-indicator" />
				<div class="stop bold">{part.stops[0].name}</div>
				<div class="line-name">
					<div class="metro-indicator">Métro</div>
					<div class="line-number" style={'--line-color:' + LINE_COLORS[part.line]}>
						{part.line}
					</div>
					<div class="duration">{formatDuration(part.duration)}</div>
				</div>
				{#each part.stops.slice(1) as stop, i}
					{@const isBold = i === part.stops.length - 2}
					<div class={'stop' + (isBold ? ' bold' : '')}>{stop.name}</div>
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	.breakdown-container {
		padding: 0 10px;
		width: 100%;
	}

	.breakdown-header {
		position: relative;
		margin-bottom: 10px;
		background: #f1f1f1;
		padding: 10px;
		border-radius: 5px;
	}

	.close-button {
		position: absolute;
		top: 10px;
		right: 10px;
		cursor: pointer;
		color: #333;
		font-size: 16px;
	}

	.breakdown-header h2 {
		font-size: 18px;
		margin: 0;
	}

	.header-duration {
		font-size: 14px;
		color: #666;
		margin-top: 5px;
	}

	.header-lines {
		display: flex;
		align-items: center;
		gap: 5px;
		margin-top: 5px;
	}

	.breakdown-part {
		position: relative;
		margin: 10px 0;
	}

	.line-name {
		display: flex;
		align-items: center;
		gap: 5px;
		margin-bottom: 5px;
	}

	.metro-indicator {
		font-size: 12px;
		color: #666;
	}
	
	.line-number {
		background-color: var(--line-color);
		color: #fff;
		width: 20px;
		height: 20px;
		font-size: 14px;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
	}

	.duration {
		font-size: 12px;
	}
	
	.stops-list {
		position: relative;
		padding-left: 14px;
	}

	.stop {
		position: relative;
	}

	.stop::before {
		content: '';
		position: absolute;
		left: -10.5px;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 8px;
		background-color: #fff;
		border: 1px solid #aaa;
		border-radius: 50%;
	}

	.stop.bold {
		font-weight: bold;
		font-size: 13pt;
	}

	.stop.bold::before {
		width: 14px;
		height: 14px;
		background: #aaa;
	}

	.left-line-indicator {
		position: absolute;
		left: 3px;
		top: 8px;
		bottom: 0;
		width: 1px;
		height: calc(100% - 16px);
		background-color: #aaa;
	}

	.connection-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		margin: 20px auto;
		font: 500 18px Arial;
	}
</style>
