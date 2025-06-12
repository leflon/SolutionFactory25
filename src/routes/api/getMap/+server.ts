import { getAdjacencyLists, getStops } from '$lib/db';
import { getMinimumSpanningTree } from '$lib/graph';
import type { Stop } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	const stops: Stop[] = getStops();
	const adjacencyLists = getAdjacencyLists();
	const minimumSpanningTree = getMinimumSpanningTree(adjacencyLists);
	const stringifiedLists = JSON.stringify(Array.from(adjacencyLists.entries()));
	const stringifiedMST = JSON.stringify(Array.from(minimumSpanningTree.entries()));

	return new Response(
		JSON.stringify({ stops, adjacencyLists: stringifiedLists, minimumSpanningTree: stringifiedMST }),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
};