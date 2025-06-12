import { getStopIdsByName } from '$lib/db';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * GET /api/searchStops
 * Returns an array of stop IDs matching the search query
 * Query parameter 'name' is required
 */
export const GET: RequestHandler = async (event) => {
	// Get and validate search query
	const query = event.url.searchParams.get('name');
	if (!query) {
		return new Response(
			JSON.stringify({ error: 'Search query parameter \'name\' is required.' }),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	// Search for matching stops
	const stops = getStopIdsByName(query);

	return new Response(
		JSON.stringify({ stops }),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
};