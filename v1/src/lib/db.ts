import Database from 'better-sqlite3';
import type { AdjancencyList, Link, Stop } from './types';

const db = new Database("data/db.sqlite");

export function getStops(): Stop[] {
	const rows = db.prepare("SELECT * FROM Stops").all().map(r => ({ ...<Stop>r, id: parseInt((<Stop>r).id as any as string) })) as Stop[];
	return rows;
}

export function getLinks(): Link[] {
	const rows = db.prepare("SELECT * FROM Links").all() as { stop1: string, stop2: string, time: string }[];
	return rows.map(row => ({
		stop1: parseInt(row.stop1),
		stop2: parseInt(row.stop2),
		time: parseInt(row.time, 10)
	}));
}

export function getStopsAdjacency(): AdjancencyList {
	const graph: Map<number, [number, number][]> = new Map();
	const rows = db.prepare("SELECT * FROM Links").all() as { stop1: string, stop2: string, time: string }[];
	for (const row of rows) {
		const stop1 = parseInt(row.stop1, 10);
		const stop2 = parseInt(row.stop2, 10);
		const time = parseInt(row.time, 10);

		if (!graph.has(stop1))
			graph.set(stop1, [[stop2, time]]);
		else
			graph.get(stop1)!.push([stop2, time]);

		if (!graph.has(stop2))
			graph.set(stop2, [[stop1, time]]);
		else
			graph.get(stop2)!.push([stop1, time]);
	}
	return graph;
}