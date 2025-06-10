import { getStopIdsByName } from '$lib/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (e) => {
	const query = e.url.searchParams.get('name');
	if (!query) {
		return new Response(
			JSON.stringify({ error: '\'name\' parameter is required.' }),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		);
	}
	const stops = getStopIdsByName(query);
	return new Response(
		JSON.stringify({ stops }),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
};