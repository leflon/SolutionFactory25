import type { Itinerary, ItineraryQuery, Link, Stop } from './types';

export interface AppState {
	stops: Stop[];
	links: Link[];
	activeItinerary: Itinerary | null;
	itineraryQuery: ItineraryQuery;
}

export const appState = $state<AppState>({
	stops: [],
	links: [],
	activeItinerary: null,
	itineraryQuery: {
		from: null,
		to: null
	}
});