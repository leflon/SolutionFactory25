import Database from 'better-sqlite3';
import type { AdjacencyLists, Link, Stop } from './types';

const db = new Database("data/db.sqlite");

/**
 * Normalizes a string for search purposes
 * Removes accents, special characters, and converts to lowercase
 * @param name String to normalize
 * @returns Normalized string
 */
function normalize(name: string): string {
	return name
		.normalize("NFD") // Decompose accented characters
		.replace(/[\u0300-\u036f]/g, "") // Remove diacritics
		.replace(/[^a-zA-Z0-9]/g, '') // Remove all non-alphanumeric characters
		.toLowerCase();
}

/**
 * Retrieves all metro stops from the database
 * @returns Array of Stop objects with position and line information
 */
export function getStops(): Stop[] {
	return db.prepare("SELECT * FROM Stops").all().map(
		(r: any) => ({
			id: parseInt(r.id, 10),
			name: r.name,
			plainName: r.plain_name,
			line: r.line,
			isTerminal: r.is_terminal === 1,
			branch: parseInt(r.branch, 10),
			position: {
				x: parseFloat(r.pos_x),
				y: parseFloat(r.pos_y)
			}
		})
	) as Stop[];
}

/**
 * Retrieves all metro line links from the database
 * @returns Array of Link objects representing connections between stops
 */
export function getLinks(): Link[] {
	const rows = db.prepare("SELECT * FROM Links").all() as { stop1: string, stop2: string, time: string }[];
	return rows.map(row => ({
		from: parseInt(row.stop1),
		to: parseInt(row.stop2),
		duration: parseInt(row.time, 10)
	}));
}

/**
 * Searches for stop IDs by name using normalized string matching
 * @param name Name to search for
 * @returns Array of matching stop IDs
 */
export function getStopIdsByName(name: string): string[] {
	const normalizedName = normalize(name);
	const rows = db.prepare("SELECT id FROM Stops WHERE plain_name LIKE ?")
		.all(`%${normalizedName}%`) as { id: string }[];
	return rows.map(row => row.id);
}

/**
 * Builds an adjacency list representation of the metro network
 * @returns Map where keys are stop IDs and values are arrays of [neighbor, duration] pairs
 */
export function getAdjacencyLists(): AdjacencyLists {
	const graph: Map<number, [number, number][]> = new Map();
	const rows = db.prepare("SELECT * FROM Links").all() as { stop1: string, stop2: string, time: string }[];

	for (const row of rows) {
		const stop1 = parseInt(row.stop1, 10);
		const stop2 = parseInt(row.stop2, 10);
		const time = parseInt(row.time, 10);

		if (!graph.has(stop1)) graph.set(stop1, [[stop2, time]]);
		else graph.get(stop1)!.push([stop2, time]);

		if (!graph.has(stop2)) graph.set(stop2, [[stop1, time]]);
		else graph.get(stop2)!.push([stop1, time]);
	}

	return graph;
}