import type { AdjacencyLists, Itinerary, ItineraryQuery, Link, Stop } from './types';

export interface AppState {
	stops: Stop[];
	mapAdjacencyLists: AdjacencyLists;
	minimumSpanningTree: AdjacencyLists;
	activeItinerary: Itinerary | null;
	itineraryQuery: ItineraryQuery;
	displayMST: boolean;
}

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