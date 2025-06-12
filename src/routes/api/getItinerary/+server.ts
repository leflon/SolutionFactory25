import { getAdjacencyLists } from '$lib/db';
import type { RequestHandler } from '@sveltejs/kit';
import { dijkstra } from '../../../lib/graph';

/**
 * GET /api/getItinerary
 * Uses Dijkstra's algorithm to compute the optimal route
 * Required query parameters:
 * - start: ID of the starting stop (from)
 * - end: ID of the destination stop (to)
 */
export const GET: RequestHandler = async (event) => {
	// Parse and validate stop IDs
	const start = parseInt(event.url.searchParams.get('start') || '');
	const end = parseInt(event.url.searchParams.get('end') || '');

	if (!start || !end) {
		return new Response(
			JSON.stringify({
				error: 'Both \'start\' and \'end\' parameters must be valid stop IDs.'
			}),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	// Get metro network and compute itinerary
	const graph = getAdjacencyLists();
	const itinerary = dijkstra(graph, start, end);

	return new Response(
		JSON.stringify({ itinerary }),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
};