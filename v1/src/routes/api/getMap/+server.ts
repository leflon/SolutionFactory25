import type { RequestHandler } from '@sveltejs/kit';
import { getStops, getLinks, getStopsAdjacency } from '$lib/db';
import type { Stop, Link } from '$lib/types';
import { dijkstra } from '../../../lib/path';

export const GET: RequestHandler = async () => {
	// Fetch stops and links from your db module
	const stops: Stop[] = await getStops();
	const links: Link[] = await getLinks();
	const ad = getStopsAdjacency();

	console.log(ad);
	const example = dijkstra(ad, 349, 99);
	console.log(example);
	return new Response(
		JSON.stringify({ stops, links, example }),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
};