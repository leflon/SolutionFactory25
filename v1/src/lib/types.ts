export type AdjacencyLists = Map<number, [number, number][]>;
export type Stop = {
	id: number;
	name: string;
	plainName: string;
	line: string;
	isTerminal: boolean;
	branch: number;
	position: {
		x: number;
		y: number;
	}
}
export type Link = {
	from: number;
	to: number;
	/**
	 * The time **in seconds** it takes to travel this link.
	 */
	duration: number;
}

export type Itinerary = {
	stops: number[];
	durations: number[];
}

export type ItineraryQuery = {
	from: number | null;
	to: number | null;
};