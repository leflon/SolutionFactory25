import type { AdjancencyList, Itinerary } from "./types";
import Heap from "heap";

/**
 * Dijkstra's algorithm to find the shortest path between two stops.
 * @param graph - The adjacency list representation of the graph.
 * @param start - The starting stop.
 * @param end - The destination stop.
 * @returns An array containing the shortest path and an array of times for each stop.
 */
export function dijkstra(graph: AdjancencyList, start: number, end: number): Itinerary {
    const distances: Record<number, number> = {};
    const previous: Record<number, number | null> = {};
    const queue = new Heap<[number, number]>((a, b) => a[1] - b[1]);
    for (const node of graph.keys()) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[start] = 0;
    queue.push([start, 0]);
    while (queue.size() > 0) {
        const [currentNode, currentDistance] = queue.pop()!;
        if (currentNode === end) {
            const stops: number[] = [];
            const times: number[] = [];
            let node: number | null = end;
            while (node !== null) {
                stops.unshift(node!);
                times.unshift(distances[node!]);
                node = previous[node];
            }
            return { stops, times };
        }
        if (currentDistance > distances[currentNode]) continue;
        for (const [neighbor, time] of graph.get(currentNode)!) {
            const distance = currentDistance + time;
            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
                previous[neighbor] = currentNode;
                queue.push([neighbor, distance]);
            }
        }
    }

    return { stops: [], times: [] };
}



