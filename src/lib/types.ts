/**
 * Graph representation using adjacency lists
 * Key: stop ID
 * Value: array of [neighbor stop ID, travel duration] pairs
 */
export type AdjacencyLists = Map<number, [number, number][]>;

/**
 * Represents a metro stop with its properties and position
 */
export type Stop = {
	/** Unique identifier for the stop */
	id: number;
	/** Display name of the stop */
	name: string;
	/** Normalized name for search purposes */
	plainName: string;
	/** Metro line identifier */
	line: string;
	/** Whether this stop is a terminal station */
	isTerminal: boolean;
	/** Branch number for multi-branch lines */
	branch: number;
	/** Position coordinates on the map */
	position: {
		x: number;
		y: number;
	}
}

/**
 * Represents a connection between two metro stops
 */
export type Link = {
	/** ID of the starting stop */
	from: number;
	/** ID of the destination stop */
	to: number;
	/** Travel duration in seconds */
	duration: number;
}

/**
 * Represents a complete itinerary between stops
 */
export type Itinerary = {
	/** Ordered list of stop IDs in the path */
	stops: number[];
	/** Travel durations between consecutive stops */
	durations: number[];
}

/**
 * Represents a search query for finding an itinerary
 */
export type ItineraryQuery = {
	/** ID of the starting stop, null if not selected */
	from: number | null;
	/** ID of the destination stop, null if not selected */
	to: number | null;
};