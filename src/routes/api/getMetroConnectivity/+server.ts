import { getAdjacencyLists } from '$lib/db';
import { checkConnectivity } from '$lib/graph';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * GET /api/getMetroConnectivity
 * Uses depth-first search to verify all stops are reachable
 */
export const GET: RequestHandler = async () => {
	// Get the metro network graph
	const graph = getAdjacencyLists();
	if (!graph) {
		return new Response(
			JSON.stringify({ error: 'Failed to retrieve metro network graph.' }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	// Check if the network is connected
	const isConnected = checkConnectivity(graph);

	return new Response(
		JSON.stringify({ isConnected }),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
};