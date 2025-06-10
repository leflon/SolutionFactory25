import { getStopsAdjacency } from '$lib/db';
import type { RequestHandler } from '@sveltejs/kit';
import { dijkstra } from '../../../lib/itinerary';

export const GET: RequestHandler = async (e) => {
	const start = parseInt(e.url.searchParams.get('start') || '');
	const end = parseInt(e.url.searchParams.get('end') || '');
	if (!start || !end) {
		return new Response(
			JSON.stringify({ error: '\'start\' and \'end\' parameters must be valid integers.' }),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		);
	}
	const matrix = getStopsAdjacency();
	const itinerary = dijkstra(matrix, start, end);
	return new Response(
		JSON.stringify({ itinerary }),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
};