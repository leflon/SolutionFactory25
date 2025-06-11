import { getAdjacencyLists } from '$lib/db';
import { checkConnectivity } from '$lib/graph';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (e) => {
	const graph = getAdjacencyLists();
	if (!graph) {
		return new Response(
			JSON.stringify({ error: 'Failed to retrieve stops adjacency matrix.' }),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
	const isConnected = checkConnectivity(graph);

	return new Response(
		JSON.stringify({ isConnected }),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
}