import type { AdjacencyLists, Itinerary, ItineraryQuery, Link, Stop } from './types';

/**
 * Application state interface defining the shape of the global state
 */
export interface AppState {
	/** List of all metro stops details */
	stops: Stop[];
	/** Graph representation of the metro network, fetched from API */
	mapAdjacencyLists: AdjacencyLists;
	/** Minimum spanning tree of the metro network, fetched from API */
	minimumSpanningTree: AdjacencyLists;
	/** Itinerary currently being displayed, fetched from API */
	activeItinerary: Itinerary | null;
	/** Current search query for finding an itinerary */
	itineraryQuery: ItineraryQuery;
	/** Whether to display the minimum spanning tree */
	displayMST: boolean;
}

/** Global application state, manages the metro network data, active itinerary, and display settings */
export const appState = $state<AppState>({
	stops: [],
	displayMST: false,
	mapAdjacencyLists: new Map(),
	minimumSpanningTree: new Map(),
	activeItinerary: null,
	itineraryQuery: {
		from: null,
		to: null
	}
});