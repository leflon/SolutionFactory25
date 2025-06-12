import { getAdjacencyLists, getStops } from '$lib/db';
import { getMinimumSpanningTree } from '$lib/graph';
import type { Stop } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * GET /api/getMap
 * Returns:
 * - List of all stops with their properties
 * - Adjacency lists representation of the network (graph)
 * - Minimum spanning tree of the network
 */
export const GET: RequestHandler = () => {
	// Get all metro stops
	const stops: Stop[] = getStops();

	// Get network graph and its minimum spanning tree
	const adjacencyLists = getAdjacencyLists();
	const minimumSpanningTree = getMinimumSpanningTree(adjacencyLists);

	// Convert Maps to arrays for JSON serialization
	const stringifiedLists = JSON.stringify(Array.from(adjacencyLists.entries()));
	const stringifiedMST = JSON.stringify(Array.from(minimumSpanningTree.entries()));

	return new Response(
		JSON.stringify({
			stops,
			adjacencyLists: stringifiedLists,
			minimumSpanningTree: stringifiedMST
		}),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
};